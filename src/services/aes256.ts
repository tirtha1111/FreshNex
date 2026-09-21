/**
 * Pure TypeScript standard AES-256 Block Cipher implementation
 * Matches NIST FIPS-197 and mbedtls AES implementation.
 */

// S-Box
const SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5e, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]);

const RCON = new Uint32Array([
  0x01000000, 0x02000000, 0x04000000, 0x08000000, 0x10000000, 0x20000000, 0x40000000, 0x80000000,
  0x1b000000, 0x36000000
]);

function subWord(w: number): number {
  return (
    (SBOX[(w >>> 24) & 0xff] << 24) |
    (SBOX[(w >>> 16) & 0xff] << 16) |
    (SBOX[(w >>> 8) & 0xff] << 8) |
    SBOX[w & 0xff]
  );
}

function rotWord(w: number): number {
  return ((w << 8) | (w >>> 24)) >>> 0;
}

/**
 * Key expansion for AES-256 (14 rounds, Nk=8, Nr=14, 60 32-bit round key words)
 */
export function aes256ExpandKey(key: Uint8Array): Uint32Array {
  if (key.length !== 32) {
    throw new Error('AES-256 requires exactly 32-byte key');
  }

  const w = new Uint32Array(60);
  for (let i = 0; i < 8; i++) {
    w[i] = (key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3];
  }

  for (let i = 8; i < 60; i++) {
    let temp = w[i - 1];
    if (i % 8 === 0) {
      temp = subWord(rotWord(temp)) ^ RCON[Math.floor(i / 8) - 1];
    } else if (i % 8 === 4) {
      temp = subWord(temp);
    }
    w[i] = (w[i - 8] ^ temp) >>> 0;
  }

  return w;
}

function xtime(a: number): number {
  return (a << 1) ^ (((a >>> 7) & 1) * 0x11b);
}

/**
 * Encrypt a single 16-byte block with AES-256
 */
export function aes256EncryptBlock(expandedKey: Uint32Array, input: Uint8Array, output: Uint8Array, outOffset: number = 0): void {
  const state = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    state[i] = input[i];
  }

  // Initial round: AddRoundKey
  for (let i = 0; i < 4; i++) {
    const k = expandedKey[i];
    state[4 * i] ^= (k >>> 24) & 0xff;
    state[4 * i + 1] ^= (k >>> 16) & 0xff;
    state[4 * i + 2] ^= (k >>> 8) & 0xff;
    state[4 * i + 3] ^= k & 0xff;
  }

  // 13 Main Rounds
  for (let round = 1; round < 14; round++) {
    // SubBytes
    for (let i = 0; i < 16; i++) {
      state[i] = SBOX[state[i]];
    }

    // ShiftRows
    const t1 = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = t1;
    const t2 = state[2]; const t6 = state[6]; state[2] = state[10]; state[6] = state[14]; state[10] = t2; state[14] = t6;
    const t3 = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = t3;

    // MixColumns
    for (let c = 0; c < 4; c++) {
      const idx = 4 * c;
      const s0 = state[idx];
      const s1 = state[idx + 1];
      const s2 = state[idx + 2];
      const s3 = state[idx + 3];

      const h = s0 ^ s1 ^ s2 ^ s3;
      state[idx] = s0 ^ xtime(s0 ^ s1) ^ h;
      state[idx + 1] = s1 ^ xtime(s1 ^ s2) ^ h;
      state[idx + 2] = s2 ^ xtime(s2 ^ s3) ^ h;
      state[idx + 3] = s3 ^ xtime(s3 ^ s0) ^ h;
    }

    // AddRoundKey
    for (let i = 0; i < 4; i++) {
      const k = expandedKey[round * 4 + i];
      state[4 * i] ^= (k >>> 24) & 0xff;
      state[4 * i + 1] ^= (k >>> 16) & 0xff;
      state[4 * i + 2] ^= (k >>> 8) & 0xff;
      state[4 * i + 3] ^= k & 0xff;
    }
  }

  // Final Round (Round 14): SubBytes + ShiftRows + AddRoundKey (No MixColumns)
  for (let i = 0; i < 16; i++) {
    state[i] = SBOX[state[i]];
  }

  const t1 = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = t1;
  const t2 = state[2]; const t6 = state[6]; state[2] = state[10]; state[6] = state[14]; state[10] = t2; state[14] = t6;
  const t3 = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = t3;

  for (let i = 0; i < 4; i++) {
    const k = expandedKey[14 * 4 + i];
    state[4 * i] ^= (k >>> 24) & 0xff;
    state[4 * i + 1] ^= (k >>> 16) & 0xff;
    state[4 * i + 2] ^= (k >>> 8) & 0xff;
    state[4 * i + 3] ^= k & 0xff;
  }

  for (let i = 0; i < 16; i++) {
    output[outOffset + i] = state[i];
  }
}

/**
 * Continuous AES-256-CTR streaming cipher matching ESP-IDF mbedtls_aes_crypt_ctr byte-for-byte.
 */
export class Aes256CtrContext {
  private expandedKey: Uint32Array;
  private counter: Uint8Array; // 16-byte big-endian counter
  private streamOut: Uint8Array; // 16-byte cached keystream block
  private ncOff: number; // 0..15 byte offset into streamOut

  constructor(key: Uint8Array, initialIv: Uint8Array) {
    this.expandedKey = aes256ExpandKey(key);
    this.counter = new Uint8Array(initialIv);
    this.streamOut = new Uint8Array(16);
    this.ncOff = 0;
  }

  /**
   * Encrypt / Decrypt data in continuous stream mode
   */
  crypt(input: Uint8Array): Uint8Array {
    const output = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      if (this.ncOff === 0) {
        // Generate new 16-byte keystream block
        aes256EncryptBlock(this.expandedKey, this.counter, this.streamOut);
        // Increment 16-byte big-endian counter
        for (let j = 15; j >= 0; j--) {
          if (++this.counter[j] !== 0) break;
        }
      }

      output[i] = input[i] ^ this.streamOut[this.ncOff];
      this.ncOff = (this.ncOff + 1) & 0x0f;
    }
    return output;
  }

  getNcOff(): number {
    return this.ncOff;
  }

  getCounter(): Uint8Array {
    return new Uint8Array(this.counter);
  }
}
