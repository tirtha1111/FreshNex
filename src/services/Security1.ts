import { Security } from './Security';
import * as proto from './generated/proto.js';
import nacl from 'tweetnacl';

/**
 * Security1 - Curve25519 Key Exchange + AES-256-CTR encryption
 * Includes optional Proof of Possession (PoP) authentication
 */
export class Security1 extends Security {
  private pop: string;
  private established: boolean = false;
  
  // Handshake keys & randoms
  private clientKeyPair: nacl.BoxKeyPair;
  private devicePubKey: Uint8Array | null = null;
  private deviceRandom: Uint8Array | null = null;
  private sessionKey: Uint8Array | null = null;

  constructor(pop: string = '12345678') {
    super();
    this.pop = pop;
    // Generate ephemeral Curve25519 key pair for client
    this.clientKeyPair = nacl.box.keyPair();
  }

  /**
   * Encrypt data using AES-256-CTR with derived sessionKey and deviceRandom as IV
   */
  async encrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.sessionKey || !this.deviceRandom) {
      throw new Error('Security session not established');
    }
    return this.aesCtrCrypt(this.sessionKey, this.deviceRandom, data);
  }

  /**
   * Decrypt data using AES-256-CTR with derived sessionKey and deviceRandom as IV
   */
  async decrypt(data: Uint8Array): Promise<Uint8Array> {
    if (!this.established || !this.sessionKey || !this.deviceRandom) {
      throw new Error('Security session not established');
    }
    return this.aesCtrCrypt(this.sessionKey, this.deviceRandom, data);
  }

  /**
   * STEP 0: Generate the first handshake request (Session_Command0)
   */
  async getSessionSetupRequest(): Promise<Uint8Array> {
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

    // 1. Compute Shared Secret (ECDH Curve25519)
    // nacl.scalarMult performs scalar multiplication of secretKey and publicKey
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

    // 4. Generate clientVerifyData = Encrypt(devicePubKey) using AES-CTR(sessionKey, deviceRandom)
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

    // Decrypt deviceVerifyData to verify device proof
    const decryptedProof = await this.aesCtrCrypt(this.sessionKey, this.deviceRandom, deviceVerifyData);

    // Verification: decrypted proof must match our client public key
    let verified = true;
    for (let i = 0; i < 32; i++) {
      if (decryptedProof[i] !== this.clientKeyPair.publicKey[i]) {
        verified = false;
        break;
      }
    }

    if (!verified) {
      throw new Error('Handshake failed: Device verification check failed (mitm protection triggered)');
    }

    this.established = true;
  }

  /**
   * Dummy/Fallback abstract implementation (mandatory override but unused in our custom 2-way client)
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
