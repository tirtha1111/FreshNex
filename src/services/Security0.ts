import { Security } from './Security';
import * as proto from './generated/proto.js';

/**
 * Security0 - Unencrypted session handshake (used when no PoP is configured on ESP32)
 */
export class Security0 extends Security {
  private established: boolean = false;

  async encrypt(data: Uint8Array): Promise<Uint8Array> {
    return data;
  }

  async decrypt(data: Uint8Array): Promise<Uint8Array> {
    return data;
  }

  async getSessionSetupRequest(): Promise<Uint8Array> {
    const setupReq = proto.SessionData.create({
      secVer: proto.SecSchemeVersion.SecScheme0,
      sec0: proto.Sec0Payload.create({
        msg: proto.Sec0MsgType.S0_Session_Command,
        sc: proto.S0SessionCmd.create({})
      })
    });
    return proto.SessionData.encode(setupReq).finish();
  }

  async processSessionSetupResponse(response: Uint8Array): Promise<void> {
    const resp = proto.SessionData.decode(response);
    if (resp.sec0?.sr?.status === proto.Status.Success) {
      this.established = true;
      console.log('[ESP32-SEC0] Security 0 session established successfully.');
    } else {
      throw new Error(`Security 0 handshake failed with status: ${resp.sec0?.sr?.status}`);
    }
  }

  isEstablished(): boolean {
    return this.established;
  }
}
