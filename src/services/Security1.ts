import { Security } from './Security';
import * as proto from './generated/proto.js';
import nacl from 'tweetnacl';

/**
 * Increment 16-byte big-endian IV by specified number of 16-byte blocks
 */
function incrementCounter(iv: Uint8Array, blocks: number): Uint8Array {
  const result = new Uint8Array(iv);
  let carry = blocks;
  for (let i = 15; i >= 0 && carry > 0; i--) {
    const sum = result[i] + carry;
    result[i] = sum & 0xff;
    carry = Math.floor(sum / 256);
  }
  return result;
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Security1 - Curve25519 Key Exchange + AES-256-CTR encryption
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

  // Running AES-CTR block counter matching ESP-IDF mbedtls stream
  private blockOffset: number = 0;

  constructor(pop: string = '12345678') {
    super();
    this.pop = pop;
    // Generate ephemeral Curve25519 key pair for client
    this.clientKeyPair = nacl.box.keyPair();
  }

  /**
   * Encrypt data using AES-256-CTR with running block counter
   */
  async encrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.sessionKey || !this.deviceRandom) {
      throw new Error('Security session not established');
    }
    const iv = incrementCounter(this.deviceRandom, this.blockOffset);
    const encrypted = await this.aesCtrCrypt(this.sessionKey, iv, data);
    this.blockOffset += Math.ceil(data.length / 16);
    return encrypted;
  }

  /**
   * Decrypt data using AES-256-CTR with running block counter
   */
  async decrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.sessionKey || !this.deviceRandom) {
      throw new Error('Security session not established');
    }
    const iv = incrementCounter(this.deviceRandom, this.blockOffset);
    const decrypted = await this.aesCtrCrypt(this.sessionKey, iv, data);
    this.blockOffset += Math.ceil(data.length / 16);
    return decrypted;
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

    // 4. Generate clientVerifyData = Encrypt(devicePubKey) using AES-CTR(sessionKey, deviceRandom)
    // Client starts at block offset 0 (32 bytes = 2 blocks)
    const clientVerifyData = await this.aesCtrCrypt(this.sessionKey, this.deviceRandom, this.devicePubKey);

    // 5. Build Session_Command1
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
    if (!deviceVerifyData || !this.sessionKey || !this.deviceRandom) {
      throw new Error('Verification parameters are incomplete');
    }

    console.log(`[ESP32-SEC1] Received deviceVerifyData (${deviceVerifyData.length} bytes)`);

    // In ESP-IDF protocomm_security1:
    // When ESP32 decrypts client_verify_data (32 bytes), 2 blocks are consumed.
    // When ESP32 encrypts client_pubkey to create device_verify_data (32 bytes), it uses counter offset +2 blocks (offset 32).
    let verified = false;
    
    // Primary check: Counter offset +2 blocks (standard ESP-IDF mbedtls CTR stream)
    const ivOffset2 = incrementCounter(this.deviceRandom, 2);
    const decryptedProofOffset2 = await this.aesCtrCrypt(this.sessionKey, ivOffset2, deviceVerifyData);
    
    let matchOffset2 = true;
    for (let i = 0; i < 32; i++) {
      if (decryptedProofOffset2[i] !== this.clientKeyPair.publicKey[i]) {
        matchOffset2 = false;
        break;
      }
    }

    if (matchOffset2) {
      verified = true;
      this.blockOffset = 4; // 2 blocks for clientVerify + 2 blocks for deviceVerify
      console.log('[ESP32-SEC1] Device verification confirmed using standard ESP-IDF stream offset (+2 blocks)!');
    } else {
      console.warn('[ESP32-SEC1] Offset +2 did not match, testing offset 0 fallback...');
      // Fallback check: Counter offset 0 (for non-streaming or static counter variants)
      const decryptedProofOffset0 = await this.aesCtrCrypt(this.sessionKey, this.deviceRandom, deviceVerifyData);
      let matchOffset0 = true;
      for (let i = 0; i < 32; i++) {
        if (decryptedProofOffset0[i] !== this.clientKeyPair.publicKey[i]) {
          matchOffset0 = false;
          break;
        }
      }

      if (matchOffset0) {
        verified = true;
        this.blockOffset = 2;
        console.log('[ESP32-SEC1] Device verification confirmed using static offset 0!');
      } else {
        console.error('[ESP32-SEC1] Client Public Key:', uint8ArrayToHex(this.clientKeyPair.publicKey));
        console.error('[ESP32-SEC1] Decrypted Proof (Offset 2):', uint8ArrayToHex(decryptedProofOffset2));
        console.error('[ESP32-SEC1] Decrypted Proof (Offset 0):', uint8ArrayToHex(decryptedProofOffset0));
      }
    }

    if (!verified) {
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

  /**
   * Helper to encrypt or decrypt using AES-256-CTR with Web Crypto API
   */
  private async aesCtrCrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CTR' },
      false,
      ['encrypt', 'decrypt']
    );

    const resultBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-CTR',
        counter: iv,
        length: 128 // Full 128-bit counter
      },
      cryptoKey,
      data
    );

    return new Uint8Array(resultBuffer);
  }
}
