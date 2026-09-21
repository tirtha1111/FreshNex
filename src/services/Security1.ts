import { Security } from './Security';
import * as proto from './generated/proto.js';
import nacl from 'tweetnacl';
import { Aes256CtrContext } from './aes256';

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Security1 - Curve25519 Key Exchange + Continuous AES-256-CTR encryption
 * Implements the official Espressif protocomm Security 1 protocol with PoP
 */
export class Security1 extends Security {
  private pop: string;
  private established: boolean = false;
  
  // Handshake keys & randoms
  private clientKeyPair: nacl.BoxKeyPair;
  private devicePubKey: Uint8Array | null = null;
  private deviceRandom: Uint8Array | null = null;
  private sessionKey: Uint8Array | null = null;

  // Continuous AES-256-CTR streaming cipher context (ESP-IDF mbedtls compatible)
  private cipher: Aes256CtrContext | null = null;

  constructor(pop: string = '12345678') {
    super();
    this.pop = pop;
    // Generate ephemeral Curve25519 key pair for client
    this.clientKeyPair = nacl.box.keyPair();
  }

  /**
   * Encrypt data using continuous AES-256-CTR keystream
   */
  async encrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.cipher) {
      throw new Error('Security session not established');
    }
    return this.cipher.crypt(data);
  }

  /**
   * Decrypt data using continuous AES-256-CTR keystream
   */
  async decrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.cipher) {
      throw new Error('Security session not established');
    }
    return this.cipher.crypt(data);
  }

  /**
   * STEP 0: Generate the first handshake request (Session_Command0)
   */
  async getSessionSetupRequest(): Promise<Uint8Array> {
    console.log('[ESP32-SEC1] Generating Session_Command0 with client Curve25519 public key...');
    const setupReq = proto.SessionData.create({});
    setupReq.secVer = proto.SecSchemeVersion.SecScheme1;
    
    setupReq.sec1 = proto.Sec1Payload.create({
      msg: proto.Sec1MsgType.Session_Command0,
      sc0: proto.SessionCmd0.create({
        clientPubkey: this.clientKeyPair.publicKey
      })
    });

    return proto.SessionData.encode(setupReq).finish();
  }

  /**
   * STEP 1: Process first response (Session_Response0) and return second request (Session_Command1)
   */
  async processSessionSetupResponse0(response: Uint8Array): Promise<Uint8Array> {
    const setupResp = proto.SessionData.decode(response);
    
    if (setupResp.secVer !== proto.SecSchemeVersion.SecScheme1 || !setupResp.sec1) {
      throw new Error('Invalid security scheme version or empty payload in response');
    }

    const sec1 = setupResp.sec1;
    if (sec1.msg !== proto.Sec1MsgType.Session_Response0 || !sec1.sr0) {
      throw new Error('Invalid session response message type for Step 0');
    }

    const sr0 = sec1.sr0;
    if (sr0.status !== proto.Status.Success) {
      throw new Error(`Device handshake failed with status: ${sr0.status}`);
    }

    this.devicePubKey = sr0.devicePubkey;
    this.deviceRandom = sr0.deviceRandom;

    if (!this.devicePubKey || this.devicePubKey.length !== 32) {
      throw new Error('Invalid device public key length (must be 32 bytes)');
    }
    if (!this.deviceRandom || this.deviceRandom.length !== 16) {
      throw new Error('Invalid device random/IV length (must be 16 bytes)');
    }

    console.log(`[ESP32-SEC1] Received device public key (32 bytes) & device random IV: ${uint8ArrayToHex(this.deviceRandom)}`);

    // 1. Compute Shared Secret (ECDH Curve25519)
    const sharedSecret = nacl.scalarMult(this.clientKeyPair.secretKey, this.devicePubKey);

    // 2. Hash Proof of Possession (SHA-256)
    const popBytes = new TextEncoder().encode(this.pop);
    const popHashBuffer = await crypto.subtle.digest('SHA-256', popBytes);
    const popHash = new Uint8Array(popHashBuffer);

    // 3. Derive Session Key (sharedSecret XOR popHash)
    this.sessionKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      this.sessionKey[i] = sharedSecret[i] ^ popHash[i];
    }

    console.log('[ESP32-SEC1] Derived AES-256 session key using Curve25519 ECDH + SHA-256(PoP).');

    // 4. Initialize continuous streaming AES-256-CTR context with sessionKey & deviceRandom
    this.cipher = new Aes256CtrContext(this.sessionKey, this.deviceRandom);

    // 5. Generate clientVerifyData = Encrypt(devicePubKey) using AES-CTR(sessionKey, deviceRandom)
    // Consumes 32 bytes (2 blocks) of the keystream
    const clientVerifyData = this.cipher.crypt(this.devicePubKey);

    // 6. Build Session_Command1
    const setupReq = proto.SessionData.create({});
    setupReq.secVer = proto.SecSchemeVersion.SecScheme1;
    setupReq.sec1 = proto.Sec1Payload.create({
      msg: proto.Sec1MsgType.Session_Command1,
      sc1: proto.SessionCmd1.create({
        clientVerifyData: clientVerifyData
      })
    });

    return proto.SessionData.encode(setupReq).finish();
  }

  /**
   * STEP 2: Process second response (Session_Response1) to complete handshake
   */
  async processSessionSetupResponse1(response: Uint8Array): Promise<void> {
    const setupResp = proto.SessionData.decode(response);

    if (setupResp.secVer !== proto.SecSchemeVersion.SecScheme1 || !setupResp.sec1) {
      throw new Error('Invalid security scheme version or empty payload in response');
    }

    const sec1 = setupResp.sec1;
    if (sec1.msg !== proto.Sec1MsgType.Session_Response1 || !sec1.sr1) {
      throw new Error('Invalid session response message type for Step 1');
    }

    const sr1 = sec1.sr1;
    if (sr1.status !== proto.Status.Success) {
      throw new Error(`Device validation failed with status: ${sr1.status}`);
    }

    const deviceVerifyData = sr1.deviceVerifyData;
    if (!deviceVerifyData || !this.sessionKey || !this.deviceRandom || !this.cipher) {
      throw new Error('Verification parameters are incomplete');
    }

    console.log(`[ESP32-SEC1] Received deviceVerifyData (${deviceVerifyData.length} bytes)`);

    // In standard ESP-IDF protocomm_security1:
    // Decrypt deviceVerifyData using the continuous cipher stream (which is at block offset +2).
    const decryptedProof = this.cipher.crypt(deviceVerifyData);

    let match = true;
    for (let i = 0; i < 32; i++) {
      if (decryptedProof[i] !== this.clientKeyPair.publicKey[i]) {
        match = false;
        break;
      }
    }

    if (!match) {
      console.warn('[ESP32-SEC1] Continuous stream decrypt did not match, trying fresh counter offset 0 fallback...');
      // Fallback: in case firmware reset its counter for response 1
      const fallbackCipher = new Aes256CtrContext(this.sessionKey, this.deviceRandom);
      const decryptedProofFallback = fallbackCipher.crypt(deviceVerifyData);
      
      let fallbackMatch = true;
      for (let i = 0; i < 32; i++) {
        if (decryptedProofFallback[i] !== this.clientKeyPair.publicKey[i]) {
          fallbackMatch = false;
          break;
        }
      }

      if (fallbackMatch) {
        console.log('[ESP32-SEC1] Device verification matched with static offset 0 cipher!');
        this.cipher = fallbackCipher;
        match = true;
      } else {
        console.error('[ESP32-SEC1] Handshake verification mismatch:');
        console.error('Expected Client PubKey:', uint8ArrayToHex(this.clientKeyPair.publicKey));
        console.error('Decrypted Proof (Stream):', uint8ArrayToHex(decryptedProof));
        console.error('Decrypted Proof (Offset 0):', uint8ArrayToHex(decryptedProofFallback));
      }
    }

    if (!match) {
      throw new Error('Handshake failed: Device verification check failed. Check Proof of Possession (PoP).');
    }

    this.established = true;
    console.log('[ESP32-SEC1] Security 1 handshake complete and verified.');
  }

  /**
   * Dummy/Fallback abstract implementation
   */
  async processSessionSetupResponse(response: Uint8Array): Promise<void> {
    throw new Error('Use processSessionSetupResponse0 and processSessionSetupResponse1 for 2-way handshake');
  }

  isEstablished(): boolean {
    return this.established;
  }
}
