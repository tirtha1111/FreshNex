/**
 * Increment 16-byte big-endian Uint8Array counter by n blocks
 */
export function incrementCounter(counter: Uint8Array, n: number): Uint8Array {
  const next = new Uint8Array(counter);
  let carry = n;
  for (let i = 15; i >= 0 && carry > 0; i--) {
    const sum = next[i] + carry;
    next[i] = sum & 0xff;
    carry = Math.floor(sum / 256);
  }
  return next;
}

/**
 * Continuous AES-256-CTR streaming cipher backed by native Web Crypto API (crypto.subtle)
 * Matches ESP-IDF mbedtls_aes_crypt_ctr byte-for-byte.
 */
export class Aes256CtrContext {
  private keyBytes: Uint8Array;
  private currentCounter: Uint8Array;
  private keystreamBuf: Uint8Array = new Uint8Array(0);
  private bufOffset: number = 0;
  private cryptoKeyPromise: Promise<CryptoKey> | null = null;

  constructor(key: Uint8Array, initialIv: Uint8Array) {
    if (key.length !== 32) {
      throw new Error('AES-256 requires 32-byte key');
    }
    if (initialIv.length !== 16) {
      throw new Error('AES-256-CTR requires 16-byte initial IV/counter');
    }
    this.keyBytes = new Uint8Array(key);
    this.currentCounter = new Uint8Array(initialIv);
  }

  private getCryptoKey(): Promise<CryptoKey> {
    if (!this.cryptoKeyPromise) {
      const cryptoImpl = typeof window !== 'undefined' && window.crypto ? window.crypto : (globalThis as any).crypto;
      this.cryptoKeyPromise = cryptoImpl.subtle.importKey(
        'raw',
        this.keyBytes,
        { name: 'AES-CTR' },
        false,
        ['encrypt', 'decrypt']
      );
    }
    return this.cryptoKeyPromise;
  }

  /**
   * Encrypt / Decrypt data in continuous streaming AES-256-CTR mode
   */
  async crypt(input: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.getCryptoKey();
    const cryptoImpl = typeof window !== 'undefined' && window.crypto ? window.crypto : (globalThis as any).crypto;
    const output = new Uint8Array(input.length);

    let inputOffset = 0;
    while (inputOffset < input.length) {
      const remainingInBuf = this.keystreamBuf.length - this.bufOffset;
      if (remainingInBuf === 0) {
        const blocksToGen = Math.max(4, Math.ceil((input.length - inputOffset) / 16));
        const dummyPlaintext = new Uint8Array(blocksToGen * 16);

        const encrypted = await cryptoImpl.subtle.encrypt(
          { name: 'AES-CTR', counter: this.currentCounter, length: 128 },
          cryptoKey,
          dummyPlaintext
        );

        this.keystreamBuf = new Uint8Array(encrypted);
        this.bufOffset = 0;
        this.currentCounter = incrementCounter(this.currentCounter, blocksToGen);
      }

      const copyLen = Math.min(input.length - inputOffset, this.keystreamBuf.length - this.bufOffset);
      for (let i = 0; i < copyLen; i++) {
        output[inputOffset + i] = input[inputOffset + i] ^ this.keystreamBuf[this.bufOffset + i];
      }

      inputOffset += copyLen;
      this.bufOffset += copyLen;
    }

    return output;
  }
}

