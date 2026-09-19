import * as $protobuf from "protobufjs";
import Long = require("long");
/** Status enum. */
export enum Status {
    Success = 0,
    InvalidSecScheme = 1,
    InvalidProto = 2,
    TooManySessions = 3,
    InvalidArgument = 4,
    InternalError = 5,
    CryptoError = 6,
    InvalidSession = 7
}

/** Represents a S0SessionCmd. */
export class S0SessionCmd implements IS0SessionCmd {

    /**
     * Constructs a new S0SessionCmd.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS0SessionCmd);

    /**
     * Creates a new S0SessionCmd instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S0SessionCmd instance
     */
    public static create(properties?: IS0SessionCmd): S0SessionCmd;

    /**
     * Encodes the specified S0SessionCmd message. Does not implicitly {@link S0SessionCmd.verify|verify} messages.
     * @param message S0SessionCmd message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS0SessionCmd, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S0SessionCmd message, length delimited. Does not implicitly {@link S0SessionCmd.verify|verify} messages.
     * @param message S0SessionCmd message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS0SessionCmd, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S0SessionCmd message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S0SessionCmd
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S0SessionCmd;

    /**
     * Decodes a S0SessionCmd message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S0SessionCmd
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S0SessionCmd;

    /**
     * Verifies a S0SessionCmd message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S0SessionCmd message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S0SessionCmd
     */
    public static fromObject(object: { [k: string]: any }): S0SessionCmd;

    /**
     * Creates a plain object from a S0SessionCmd message. Also converts values to other types if specified.
     * @param message S0SessionCmd
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S0SessionCmd, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S0SessionCmd to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S0SessionCmd
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a S0SessionResp. */
export class S0SessionResp implements IS0SessionResp {

    /**
     * Constructs a new S0SessionResp.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS0SessionResp);

    /** S0SessionResp status. */
    public status: Status;

    /**
     * Creates a new S0SessionResp instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S0SessionResp instance
     */
    public static create(properties?: IS0SessionResp): S0SessionResp;

    /**
     * Encodes the specified S0SessionResp message. Does not implicitly {@link S0SessionResp.verify|verify} messages.
     * @param message S0SessionResp message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS0SessionResp, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S0SessionResp message, length delimited. Does not implicitly {@link S0SessionResp.verify|verify} messages.
     * @param message S0SessionResp message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS0SessionResp, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S0SessionResp message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S0SessionResp
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S0SessionResp;

    /**
     * Decodes a S0SessionResp message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S0SessionResp
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S0SessionResp;

    /**
     * Verifies a S0SessionResp message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S0SessionResp message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S0SessionResp
     */
    public static fromObject(object: { [k: string]: any }): S0SessionResp;

    /**
     * Creates a plain object from a S0SessionResp message. Also converts values to other types if specified.
     * @param message S0SessionResp
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S0SessionResp, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S0SessionResp to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S0SessionResp
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Sec0MsgType enum. */
export enum Sec0MsgType {
    S0_Session_Command = 0,
    S0_Session_Response = 1
}

/** Represents a Sec0Payload. */
export class Sec0Payload implements ISec0Payload {

    /**
     * Constructs a new Sec0Payload.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISec0Payload);

    /** Sec0Payload msg. */
    public msg: Sec0MsgType;

    /** Sec0Payload sc. */
    public sc?: (IS0SessionCmd|null);

    /** Sec0Payload sr. */
    public sr?: (IS0SessionResp|null);

    /** Sec0Payload payload. */
    public payload?: ("sc"|"sr");

    /**
     * Creates a new Sec0Payload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Sec0Payload instance
     */
    public static create(properties?: ISec0Payload): Sec0Payload;

    /**
     * Encodes the specified Sec0Payload message. Does not implicitly {@link Sec0Payload.verify|verify} messages.
     * @param message Sec0Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISec0Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Sec0Payload message, length delimited. Does not implicitly {@link Sec0Payload.verify|verify} messages.
     * @param message Sec0Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISec0Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Sec0Payload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Sec0Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Sec0Payload;

    /**
     * Decodes a Sec0Payload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Sec0Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Sec0Payload;

    /**
     * Verifies a Sec0Payload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Sec0Payload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Sec0Payload
     */
    public static fromObject(object: { [k: string]: any }): Sec0Payload;

    /**
     * Creates a plain object from a Sec0Payload message. Also converts values to other types if specified.
     * @param message Sec0Payload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Sec0Payload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Sec0Payload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Sec0Payload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SessionCmd1. */
export class SessionCmd1 implements ISessionCmd1 {

    /**
     * Constructs a new SessionCmd1.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISessionCmd1);

    /** SessionCmd1 clientVerifyData. */
    public clientVerifyData: Uint8Array;

    /**
     * Creates a new SessionCmd1 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SessionCmd1 instance
     */
    public static create(properties?: ISessionCmd1): SessionCmd1;

    /**
     * Encodes the specified SessionCmd1 message. Does not implicitly {@link SessionCmd1.verify|verify} messages.
     * @param message SessionCmd1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SessionCmd1 message, length delimited. Does not implicitly {@link SessionCmd1.verify|verify} messages.
     * @param message SessionCmd1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SessionCmd1 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SessionCmd1;

    /**
     * Decodes a SessionCmd1 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SessionCmd1;

    /**
     * Verifies a SessionCmd1 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SessionCmd1 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SessionCmd1
     */
    public static fromObject(object: { [k: string]: any }): SessionCmd1;

    /**
     * Creates a plain object from a SessionCmd1 message. Also converts values to other types if specified.
     * @param message SessionCmd1
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SessionCmd1, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SessionCmd1 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SessionCmd1
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SessionResp1. */
export class SessionResp1 implements ISessionResp1 {

    /**
     * Constructs a new SessionResp1.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISessionResp1);

    /** SessionResp1 status. */
    public status: Status;

    /** SessionResp1 deviceVerifyData. */
    public deviceVerifyData: Uint8Array;

    /**
     * Creates a new SessionResp1 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SessionResp1 instance
     */
    public static create(properties?: ISessionResp1): SessionResp1;

    /**
     * Encodes the specified SessionResp1 message. Does not implicitly {@link SessionResp1.verify|verify} messages.
     * @param message SessionResp1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SessionResp1 message, length delimited. Does not implicitly {@link SessionResp1.verify|verify} messages.
     * @param message SessionResp1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SessionResp1 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SessionResp1;

    /**
     * Decodes a SessionResp1 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SessionResp1;

    /**
     * Verifies a SessionResp1 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SessionResp1 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SessionResp1
     */
    public static fromObject(object: { [k: string]: any }): SessionResp1;

    /**
     * Creates a plain object from a SessionResp1 message. Also converts values to other types if specified.
     * @param message SessionResp1
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SessionResp1, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SessionResp1 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SessionResp1
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SessionCmd0. */
export class SessionCmd0 implements ISessionCmd0 {

    /**
     * Constructs a new SessionCmd0.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISessionCmd0);

    /** SessionCmd0 clientPubkey. */
    public clientPubkey: Uint8Array;

    /**
     * Creates a new SessionCmd0 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SessionCmd0 instance
     */
    public static create(properties?: ISessionCmd0): SessionCmd0;

    /**
     * Encodes the specified SessionCmd0 message. Does not implicitly {@link SessionCmd0.verify|verify} messages.
     * @param message SessionCmd0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SessionCmd0 message, length delimited. Does not implicitly {@link SessionCmd0.verify|verify} messages.
     * @param message SessionCmd0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SessionCmd0 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SessionCmd0;

    /**
     * Decodes a SessionCmd0 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SessionCmd0;

    /**
     * Verifies a SessionCmd0 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SessionCmd0 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SessionCmd0
     */
    public static fromObject(object: { [k: string]: any }): SessionCmd0;

    /**
     * Creates a plain object from a SessionCmd0 message. Also converts values to other types if specified.
     * @param message SessionCmd0
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SessionCmd0, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SessionCmd0 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SessionCmd0
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SessionResp0. */
export class SessionResp0 implements ISessionResp0 {

    /**
     * Constructs a new SessionResp0.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISessionResp0);

    /** SessionResp0 status. */
    public status: Status;

    /** SessionResp0 devicePubkey. */
    public devicePubkey: Uint8Array;

    /** SessionResp0 deviceRandom. */
    public deviceRandom: Uint8Array;

    /**
     * Creates a new SessionResp0 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SessionResp0 instance
     */
    public static create(properties?: ISessionResp0): SessionResp0;

    /**
     * Encodes the specified SessionResp0 message. Does not implicitly {@link SessionResp0.verify|verify} messages.
     * @param message SessionResp0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SessionResp0 message, length delimited. Does not implicitly {@link SessionResp0.verify|verify} messages.
     * @param message SessionResp0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SessionResp0 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SessionResp0;

    /**
     * Decodes a SessionResp0 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SessionResp0;

    /**
     * Verifies a SessionResp0 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SessionResp0 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SessionResp0
     */
    public static fromObject(object: { [k: string]: any }): SessionResp0;

    /**
     * Creates a plain object from a SessionResp0 message. Also converts values to other types if specified.
     * @param message SessionResp0
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SessionResp0, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SessionResp0 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SessionResp0
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Sec1MsgType enum. */
export enum Sec1MsgType {
    Session_Command0 = 0,
    Session_Response0 = 1,
    Session_Command1 = 2,
    Session_Response1 = 3
}

/** Represents a Sec1Payload. */
export class Sec1Payload implements ISec1Payload {

    /**
     * Constructs a new Sec1Payload.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISec1Payload);

    /** Sec1Payload msg. */
    public msg: Sec1MsgType;

    /** Sec1Payload sc0. */
    public sc0?: (ISessionCmd0|null);

    /** Sec1Payload sr0. */
    public sr0?: (ISessionResp0|null);

    /** Sec1Payload sc1. */
    public sc1?: (ISessionCmd1|null);

    /** Sec1Payload sr1. */
    public sr1?: (ISessionResp1|null);

    /** Sec1Payload payload. */
    public payload?: ("sc0"|"sr0"|"sc1"|"sr1");

    /**
     * Creates a new Sec1Payload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Sec1Payload instance
     */
    public static create(properties?: ISec1Payload): Sec1Payload;

    /**
     * Encodes the specified Sec1Payload message. Does not implicitly {@link Sec1Payload.verify|verify} messages.
     * @param message Sec1Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISec1Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Sec1Payload message, length delimited. Does not implicitly {@link Sec1Payload.verify|verify} messages.
     * @param message Sec1Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISec1Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Sec1Payload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Sec1Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Sec1Payload;

    /**
     * Decodes a Sec1Payload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Sec1Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Sec1Payload;

    /**
     * Verifies a Sec1Payload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Sec1Payload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Sec1Payload
     */
    public static fromObject(object: { [k: string]: any }): Sec1Payload;

    /**
     * Creates a plain object from a Sec1Payload message. Also converts values to other types if specified.
     * @param message Sec1Payload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Sec1Payload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Sec1Payload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Sec1Payload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Sec2MsgType enum. */
export enum Sec2MsgType {
    S2Session_Command0 = 0,
    S2Session_Response0 = 1,
    S2Session_Command1 = 2,
    S2Session_Response1 = 3
}

/** Represents a S2SessionCmd0. */
export class S2SessionCmd0 implements IS2SessionCmd0 {

    /**
     * Constructs a new S2SessionCmd0.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS2SessionCmd0);

    /** S2SessionCmd0 clientUsername. */
    public clientUsername: Uint8Array;

    /** S2SessionCmd0 clientPubkey. */
    public clientPubkey: Uint8Array;

    /**
     * Creates a new S2SessionCmd0 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S2SessionCmd0 instance
     */
    public static create(properties?: IS2SessionCmd0): S2SessionCmd0;

    /**
     * Encodes the specified S2SessionCmd0 message. Does not implicitly {@link S2SessionCmd0.verify|verify} messages.
     * @param message S2SessionCmd0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS2SessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S2SessionCmd0 message, length delimited. Does not implicitly {@link S2SessionCmd0.verify|verify} messages.
     * @param message S2SessionCmd0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS2SessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S2SessionCmd0 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S2SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S2SessionCmd0;

    /**
     * Decodes a S2SessionCmd0 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S2SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S2SessionCmd0;

    /**
     * Verifies a S2SessionCmd0 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S2SessionCmd0 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S2SessionCmd0
     */
    public static fromObject(object: { [k: string]: any }): S2SessionCmd0;

    /**
     * Creates a plain object from a S2SessionCmd0 message. Also converts values to other types if specified.
     * @param message S2SessionCmd0
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S2SessionCmd0, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S2SessionCmd0 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S2SessionCmd0
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a S2SessionResp0. */
export class S2SessionResp0 implements IS2SessionResp0 {

    /**
     * Constructs a new S2SessionResp0.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS2SessionResp0);

    /** S2SessionResp0 status. */
    public status: Status;

    /** S2SessionResp0 devicePubkey. */
    public devicePubkey: Uint8Array;

    /** S2SessionResp0 deviceSalt. */
    public deviceSalt: Uint8Array;

    /**
     * Creates a new S2SessionResp0 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S2SessionResp0 instance
     */
    public static create(properties?: IS2SessionResp0): S2SessionResp0;

    /**
     * Encodes the specified S2SessionResp0 message. Does not implicitly {@link S2SessionResp0.verify|verify} messages.
     * @param message S2SessionResp0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS2SessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S2SessionResp0 message, length delimited. Does not implicitly {@link S2SessionResp0.verify|verify} messages.
     * @param message S2SessionResp0 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS2SessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S2SessionResp0 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S2SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S2SessionResp0;

    /**
     * Decodes a S2SessionResp0 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S2SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S2SessionResp0;

    /**
     * Verifies a S2SessionResp0 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S2SessionResp0 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S2SessionResp0
     */
    public static fromObject(object: { [k: string]: any }): S2SessionResp0;

    /**
     * Creates a plain object from a S2SessionResp0 message. Also converts values to other types if specified.
     * @param message S2SessionResp0
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S2SessionResp0, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S2SessionResp0 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S2SessionResp0
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a S2SessionCmd1. */
export class S2SessionCmd1 implements IS2SessionCmd1 {

    /**
     * Constructs a new S2SessionCmd1.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS2SessionCmd1);

    /** S2SessionCmd1 clientProof. */
    public clientProof: Uint8Array;

    /**
     * Creates a new S2SessionCmd1 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S2SessionCmd1 instance
     */
    public static create(properties?: IS2SessionCmd1): S2SessionCmd1;

    /**
     * Encodes the specified S2SessionCmd1 message. Does not implicitly {@link S2SessionCmd1.verify|verify} messages.
     * @param message S2SessionCmd1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS2SessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S2SessionCmd1 message, length delimited. Does not implicitly {@link S2SessionCmd1.verify|verify} messages.
     * @param message S2SessionCmd1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS2SessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S2SessionCmd1 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S2SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S2SessionCmd1;

    /**
     * Decodes a S2SessionCmd1 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S2SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S2SessionCmd1;

    /**
     * Verifies a S2SessionCmd1 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S2SessionCmd1 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S2SessionCmd1
     */
    public static fromObject(object: { [k: string]: any }): S2SessionCmd1;

    /**
     * Creates a plain object from a S2SessionCmd1 message. Also converts values to other types if specified.
     * @param message S2SessionCmd1
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S2SessionCmd1, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S2SessionCmd1 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S2SessionCmd1
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a S2SessionResp1. */
export class S2SessionResp1 implements IS2SessionResp1 {

    /**
     * Constructs a new S2SessionResp1.
     * @param [properties] Properties to set
     */
    constructor(properties?: IS2SessionResp1);

    /** S2SessionResp1 status. */
    public status: Status;

    /** S2SessionResp1 deviceProof. */
    public deviceProof: Uint8Array;

    /** S2SessionResp1 deviceNonce. */
    public deviceNonce: Uint8Array;

    /**
     * Creates a new S2SessionResp1 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns S2SessionResp1 instance
     */
    public static create(properties?: IS2SessionResp1): S2SessionResp1;

    /**
     * Encodes the specified S2SessionResp1 message. Does not implicitly {@link S2SessionResp1.verify|verify} messages.
     * @param message S2SessionResp1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IS2SessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified S2SessionResp1 message, length delimited. Does not implicitly {@link S2SessionResp1.verify|verify} messages.
     * @param message S2SessionResp1 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IS2SessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a S2SessionResp1 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns S2SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): S2SessionResp1;

    /**
     * Decodes a S2SessionResp1 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns S2SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): S2SessionResp1;

    /**
     * Verifies a S2SessionResp1 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a S2SessionResp1 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns S2SessionResp1
     */
    public static fromObject(object: { [k: string]: any }): S2SessionResp1;

    /**
     * Creates a plain object from a S2SessionResp1 message. Also converts values to other types if specified.
     * @param message S2SessionResp1
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: S2SessionResp1, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this S2SessionResp1 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for S2SessionResp1
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a Sec2Payload. */
export class Sec2Payload implements ISec2Payload {

    /**
     * Constructs a new Sec2Payload.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISec2Payload);

    /** Sec2Payload msg. */
    public msg: Sec2MsgType;

    /** Sec2Payload sc0. */
    public sc0?: (IS2SessionCmd0|null);

    /** Sec2Payload sr0. */
    public sr0?: (IS2SessionResp0|null);

    /** Sec2Payload sc1. */
    public sc1?: (IS2SessionCmd1|null);

    /** Sec2Payload sr1. */
    public sr1?: (IS2SessionResp1|null);

    /** Sec2Payload payload. */
    public payload?: ("sc0"|"sr0"|"sc1"|"sr1");

    /**
     * Creates a new Sec2Payload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Sec2Payload instance
     */
    public static create(properties?: ISec2Payload): Sec2Payload;

    /**
     * Encodes the specified Sec2Payload message. Does not implicitly {@link Sec2Payload.verify|verify} messages.
     * @param message Sec2Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISec2Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Sec2Payload message, length delimited. Does not implicitly {@link Sec2Payload.verify|verify} messages.
     * @param message Sec2Payload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISec2Payload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Sec2Payload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Sec2Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Sec2Payload;

    /**
     * Decodes a Sec2Payload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Sec2Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Sec2Payload;

    /**
     * Verifies a Sec2Payload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Sec2Payload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Sec2Payload
     */
    public static fromObject(object: { [k: string]: any }): Sec2Payload;

    /**
     * Creates a plain object from a Sec2Payload message. Also converts values to other types if specified.
     * @param message Sec2Payload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Sec2Payload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Sec2Payload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Sec2Payload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** SecSchemeVersion enum. */
export enum SecSchemeVersion {
    SecScheme0 = 0,
    SecScheme1 = 1,
    SecScheme2 = 2
}

/** Represents a SessionData. */
export class SessionData implements ISessionData {

    /**
     * Constructs a new SessionData.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISessionData);

    /** SessionData secVer. */
    public secVer: SecSchemeVersion;

    /** SessionData sec0. */
    public sec0?: (ISec0Payload|null);

    /** SessionData sec1. */
    public sec1?: (ISec1Payload|null);

    /** SessionData sec2. */
    public sec2?: (ISec2Payload|null);

    /** SessionData proto. */
    public proto?: ("sec0"|"sec1"|"sec2");

    /**
     * Creates a new SessionData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SessionData instance
     */
    public static create(properties?: ISessionData): SessionData;

    /**
     * Encodes the specified SessionData message. Does not implicitly {@link SessionData.verify|verify} messages.
     * @param message SessionData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISessionData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SessionData message, length delimited. Does not implicitly {@link SessionData.verify|verify} messages.
     * @param message SessionData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISessionData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SessionData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SessionData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SessionData;

    /**
     * Decodes a SessionData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SessionData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SessionData;

    /**
     * Verifies a SessionData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SessionData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SessionData
     */
    public static fromObject(object: { [k: string]: any }): SessionData;

    /**
     * Creates a plain object from a SessionData message. Also converts values to other types if specified.
     * @param message SessionData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SessionData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SessionData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SessionData
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdGetStatus. */
export class CmdGetStatus implements ICmdGetStatus {

    /**
     * Constructs a new CmdGetStatus.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdGetStatus);

    /**
     * Creates a new CmdGetStatus instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdGetStatus instance
     */
    public static create(properties?: ICmdGetStatus): CmdGetStatus;

    /**
     * Encodes the specified CmdGetStatus message. Does not implicitly {@link CmdGetStatus.verify|verify} messages.
     * @param message CmdGetStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdGetStatus message, length delimited. Does not implicitly {@link CmdGetStatus.verify|verify} messages.
     * @param message CmdGetStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdGetStatus message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdGetStatus;

    /**
     * Decodes a CmdGetStatus message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdGetStatus;

    /**
     * Verifies a CmdGetStatus message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdGetStatus message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdGetStatus
     */
    public static fromObject(object: { [k: string]: any }): CmdGetStatus;

    /**
     * Creates a plain object from a CmdGetStatus message. Also converts values to other types if specified.
     * @param message CmdGetStatus
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdGetStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdGetStatus to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdGetStatus
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespGetStatus. */
export class RespGetStatus implements IRespGetStatus {

    /**
     * Constructs a new RespGetStatus.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespGetStatus);

    /** RespGetStatus status. */
    public status: Status;

    /** RespGetStatus staState. */
    public staState: WifiStationState;

    /** RespGetStatus failReason. */
    public failReason?: (WifiConnectFailedReason|null);

    /** RespGetStatus connected. */
    public connected?: (IWifiConnectedState|null);

    /** RespGetStatus state. */
    public state?: ("failReason"|"connected");

    /**
     * Creates a new RespGetStatus instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespGetStatus instance
     */
    public static create(properties?: IRespGetStatus): RespGetStatus;

    /**
     * Encodes the specified RespGetStatus message. Does not implicitly {@link RespGetStatus.verify|verify} messages.
     * @param message RespGetStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespGetStatus message, length delimited. Does not implicitly {@link RespGetStatus.verify|verify} messages.
     * @param message RespGetStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespGetStatus message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespGetStatus;

    /**
     * Decodes a RespGetStatus message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespGetStatus;

    /**
     * Verifies a RespGetStatus message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespGetStatus message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespGetStatus
     */
    public static fromObject(object: { [k: string]: any }): RespGetStatus;

    /**
     * Creates a plain object from a RespGetStatus message. Also converts values to other types if specified.
     * @param message RespGetStatus
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespGetStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespGetStatus to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespGetStatus
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdSetConfig. */
export class CmdSetConfig implements ICmdSetConfig {

    /**
     * Constructs a new CmdSetConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdSetConfig);

    /** CmdSetConfig ssid. */
    public ssid: Uint8Array;

    /** CmdSetConfig passphrase. */
    public passphrase: Uint8Array;

    /** CmdSetConfig bssid. */
    public bssid: Uint8Array;

    /** CmdSetConfig channel. */
    public channel: number;

    /**
     * Creates a new CmdSetConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdSetConfig instance
     */
    public static create(properties?: ICmdSetConfig): CmdSetConfig;

    /**
     * Encodes the specified CmdSetConfig message. Does not implicitly {@link CmdSetConfig.verify|verify} messages.
     * @param message CmdSetConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdSetConfig message, length delimited. Does not implicitly {@link CmdSetConfig.verify|verify} messages.
     * @param message CmdSetConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdSetConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdSetConfig;

    /**
     * Decodes a CmdSetConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdSetConfig;

    /**
     * Verifies a CmdSetConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdSetConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdSetConfig
     */
    public static fromObject(object: { [k: string]: any }): CmdSetConfig;

    /**
     * Creates a plain object from a CmdSetConfig message. Also converts values to other types if specified.
     * @param message CmdSetConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdSetConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdSetConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdSetConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespSetConfig. */
export class RespSetConfig implements IRespSetConfig {

    /**
     * Constructs a new RespSetConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespSetConfig);

    /** RespSetConfig status. */
    public status: Status;

    /**
     * Creates a new RespSetConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespSetConfig instance
     */
    public static create(properties?: IRespSetConfig): RespSetConfig;

    /**
     * Encodes the specified RespSetConfig message. Does not implicitly {@link RespSetConfig.verify|verify} messages.
     * @param message RespSetConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespSetConfig message, length delimited. Does not implicitly {@link RespSetConfig.verify|verify} messages.
     * @param message RespSetConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespSetConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespSetConfig;

    /**
     * Decodes a RespSetConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespSetConfig;

    /**
     * Verifies a RespSetConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespSetConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespSetConfig
     */
    public static fromObject(object: { [k: string]: any }): RespSetConfig;

    /**
     * Creates a plain object from a RespSetConfig message. Also converts values to other types if specified.
     * @param message RespSetConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespSetConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespSetConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespSetConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdApplyConfig. */
export class CmdApplyConfig implements ICmdApplyConfig {

    /**
     * Constructs a new CmdApplyConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdApplyConfig);

    /**
     * Creates a new CmdApplyConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdApplyConfig instance
     */
    public static create(properties?: ICmdApplyConfig): CmdApplyConfig;

    /**
     * Encodes the specified CmdApplyConfig message. Does not implicitly {@link CmdApplyConfig.verify|verify} messages.
     * @param message CmdApplyConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdApplyConfig message, length delimited. Does not implicitly {@link CmdApplyConfig.verify|verify} messages.
     * @param message CmdApplyConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdApplyConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdApplyConfig;

    /**
     * Decodes a CmdApplyConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdApplyConfig;

    /**
     * Verifies a CmdApplyConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdApplyConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdApplyConfig
     */
    public static fromObject(object: { [k: string]: any }): CmdApplyConfig;

    /**
     * Creates a plain object from a CmdApplyConfig message. Also converts values to other types if specified.
     * @param message CmdApplyConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdApplyConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdApplyConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdApplyConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespApplyConfig. */
export class RespApplyConfig implements IRespApplyConfig {

    /**
     * Constructs a new RespApplyConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespApplyConfig);

    /** RespApplyConfig status. */
    public status: Status;

    /**
     * Creates a new RespApplyConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespApplyConfig instance
     */
    public static create(properties?: IRespApplyConfig): RespApplyConfig;

    /**
     * Encodes the specified RespApplyConfig message. Does not implicitly {@link RespApplyConfig.verify|verify} messages.
     * @param message RespApplyConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespApplyConfig message, length delimited. Does not implicitly {@link RespApplyConfig.verify|verify} messages.
     * @param message RespApplyConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespApplyConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespApplyConfig;

    /**
     * Decodes a RespApplyConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespApplyConfig;

    /**
     * Verifies a RespApplyConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespApplyConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespApplyConfig
     */
    public static fromObject(object: { [k: string]: any }): RespApplyConfig;

    /**
     * Creates a plain object from a RespApplyConfig message. Also converts values to other types if specified.
     * @param message RespApplyConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespApplyConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespApplyConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespApplyConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** WiFiConfigMsgType enum. */
export enum WiFiConfigMsgType {
    TypeCmdGetStatus = 0,
    TypeRespGetStatus = 1,
    TypeCmdSetConfig = 2,
    TypeRespSetConfig = 3,
    TypeCmdApplyConfig = 4,
    TypeRespApplyConfig = 5
}

/** Represents a WiFiConfigPayload. */
export class WiFiConfigPayload implements IWiFiConfigPayload {

    /**
     * Constructs a new WiFiConfigPayload.
     * @param [properties] Properties to set
     */
    constructor(properties?: IWiFiConfigPayload);

    /** WiFiConfigPayload msg. */
    public msg: WiFiConfigMsgType;

    /** WiFiConfigPayload cmdGetStatus. */
    public cmdGetStatus?: (ICmdGetStatus|null);

    /** WiFiConfigPayload respGetStatus. */
    public respGetStatus?: (IRespGetStatus|null);

    /** WiFiConfigPayload cmdSetConfig. */
    public cmdSetConfig?: (ICmdSetConfig|null);

    /** WiFiConfigPayload respSetConfig. */
    public respSetConfig?: (IRespSetConfig|null);

    /** WiFiConfigPayload cmdApplyConfig. */
    public cmdApplyConfig?: (ICmdApplyConfig|null);

    /** WiFiConfigPayload respApplyConfig. */
    public respApplyConfig?: (IRespApplyConfig|null);

    /** WiFiConfigPayload payload. */
    public payload?: ("cmdGetStatus"|"respGetStatus"|"cmdSetConfig"|"respSetConfig"|"cmdApplyConfig"|"respApplyConfig");

    /**
     * Creates a new WiFiConfigPayload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WiFiConfigPayload instance
     */
    public static create(properties?: IWiFiConfigPayload): WiFiConfigPayload;

    /**
     * Encodes the specified WiFiConfigPayload message. Does not implicitly {@link WiFiConfigPayload.verify|verify} messages.
     * @param message WiFiConfigPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IWiFiConfigPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WiFiConfigPayload message, length delimited. Does not implicitly {@link WiFiConfigPayload.verify|verify} messages.
     * @param message WiFiConfigPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IWiFiConfigPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WiFiConfigPayload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns WiFiConfigPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WiFiConfigPayload;

    /**
     * Decodes a WiFiConfigPayload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns WiFiConfigPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WiFiConfigPayload;

    /**
     * Verifies a WiFiConfigPayload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WiFiConfigPayload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WiFiConfigPayload
     */
    public static fromObject(object: { [k: string]: any }): WiFiConfigPayload;

    /**
     * Creates a plain object from a WiFiConfigPayload message. Also converts values to other types if specified.
     * @param message WiFiConfigPayload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: WiFiConfigPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WiFiConfigPayload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for WiFiConfigPayload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** WifiStationState enum. */
export enum WifiStationState {
    Connected = 0,
    Connecting = 1,
    Disconnected = 2,
    ConnectionFailed = 3
}

/** WifiConnectFailedReason enum. */
export enum WifiConnectFailedReason {
    AuthError = 0,
    NetworkNotFound = 1
}

/** WifiAuthMode enum. */
export enum WifiAuthMode {
    Open = 0,
    WEP = 1,
    WPA_PSK = 2,
    WPA2_PSK = 3,
    WPA_WPA2_PSK = 4,
    WPA2_ENTERPRISE = 5,
    WPA3_PSK = 6,
    WPA2_WPA3_PSK = 7
}

/** Represents a WifiConnectedState. */
export class WifiConnectedState implements IWifiConnectedState {

    /**
     * Constructs a new WifiConnectedState.
     * @param [properties] Properties to set
     */
    constructor(properties?: IWifiConnectedState);

    /** WifiConnectedState ip4Addr. */
    public ip4Addr: string;

    /** WifiConnectedState authMode. */
    public authMode: WifiAuthMode;

    /** WifiConnectedState ssid. */
    public ssid: Uint8Array;

    /** WifiConnectedState bssid. */
    public bssid: Uint8Array;

    /** WifiConnectedState channel. */
    public channel: number;

    /**
     * Creates a new WifiConnectedState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WifiConnectedState instance
     */
    public static create(properties?: IWifiConnectedState): WifiConnectedState;

    /**
     * Encodes the specified WifiConnectedState message. Does not implicitly {@link WifiConnectedState.verify|verify} messages.
     * @param message WifiConnectedState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IWifiConnectedState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WifiConnectedState message, length delimited. Does not implicitly {@link WifiConnectedState.verify|verify} messages.
     * @param message WifiConnectedState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IWifiConnectedState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WifiConnectedState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns WifiConnectedState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WifiConnectedState;

    /**
     * Decodes a WifiConnectedState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns WifiConnectedState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WifiConnectedState;

    /**
     * Verifies a WifiConnectedState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WifiConnectedState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WifiConnectedState
     */
    public static fromObject(object: { [k: string]: any }): WifiConnectedState;

    /**
     * Creates a plain object from a WifiConnectedState message. Also converts values to other types if specified.
     * @param message WifiConnectedState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: WifiConnectedState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WifiConnectedState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for WifiConnectedState
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdCtrlReset. */
export class CmdCtrlReset implements ICmdCtrlReset {

    /**
     * Constructs a new CmdCtrlReset.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdCtrlReset);

    /**
     * Creates a new CmdCtrlReset instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdCtrlReset instance
     */
    public static create(properties?: ICmdCtrlReset): CmdCtrlReset;

    /**
     * Encodes the specified CmdCtrlReset message. Does not implicitly {@link CmdCtrlReset.verify|verify} messages.
     * @param message CmdCtrlReset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdCtrlReset, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdCtrlReset message, length delimited. Does not implicitly {@link CmdCtrlReset.verify|verify} messages.
     * @param message CmdCtrlReset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdCtrlReset, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdCtrlReset message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdCtrlReset;

    /**
     * Decodes a CmdCtrlReset message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdCtrlReset;

    /**
     * Verifies a CmdCtrlReset message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdCtrlReset message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdCtrlReset
     */
    public static fromObject(object: { [k: string]: any }): CmdCtrlReset;

    /**
     * Creates a plain object from a CmdCtrlReset message. Also converts values to other types if specified.
     * @param message CmdCtrlReset
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdCtrlReset, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdCtrlReset to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdCtrlReset
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespCtrlReset. */
export class RespCtrlReset implements IRespCtrlReset {

    /**
     * Constructs a new RespCtrlReset.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespCtrlReset);

    /**
     * Creates a new RespCtrlReset instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespCtrlReset instance
     */
    public static create(properties?: IRespCtrlReset): RespCtrlReset;

    /**
     * Encodes the specified RespCtrlReset message. Does not implicitly {@link RespCtrlReset.verify|verify} messages.
     * @param message RespCtrlReset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespCtrlReset, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespCtrlReset message, length delimited. Does not implicitly {@link RespCtrlReset.verify|verify} messages.
     * @param message RespCtrlReset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespCtrlReset, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespCtrlReset message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespCtrlReset;

    /**
     * Decodes a RespCtrlReset message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespCtrlReset;

    /**
     * Verifies a RespCtrlReset message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespCtrlReset message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespCtrlReset
     */
    public static fromObject(object: { [k: string]: any }): RespCtrlReset;

    /**
     * Creates a plain object from a RespCtrlReset message. Also converts values to other types if specified.
     * @param message RespCtrlReset
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespCtrlReset, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespCtrlReset to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespCtrlReset
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdCtrlReprov. */
export class CmdCtrlReprov implements ICmdCtrlReprov {

    /**
     * Constructs a new CmdCtrlReprov.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdCtrlReprov);

    /**
     * Creates a new CmdCtrlReprov instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdCtrlReprov instance
     */
    public static create(properties?: ICmdCtrlReprov): CmdCtrlReprov;

    /**
     * Encodes the specified CmdCtrlReprov message. Does not implicitly {@link CmdCtrlReprov.verify|verify} messages.
     * @param message CmdCtrlReprov message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdCtrlReprov, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdCtrlReprov message, length delimited. Does not implicitly {@link CmdCtrlReprov.verify|verify} messages.
     * @param message CmdCtrlReprov message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdCtrlReprov, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdCtrlReprov message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdCtrlReprov;

    /**
     * Decodes a CmdCtrlReprov message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdCtrlReprov;

    /**
     * Verifies a CmdCtrlReprov message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdCtrlReprov message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdCtrlReprov
     */
    public static fromObject(object: { [k: string]: any }): CmdCtrlReprov;

    /**
     * Creates a plain object from a CmdCtrlReprov message. Also converts values to other types if specified.
     * @param message CmdCtrlReprov
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdCtrlReprov, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdCtrlReprov to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdCtrlReprov
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespCtrlReprov. */
export class RespCtrlReprov implements IRespCtrlReprov {

    /**
     * Constructs a new RespCtrlReprov.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespCtrlReprov);

    /**
     * Creates a new RespCtrlReprov instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespCtrlReprov instance
     */
    public static create(properties?: IRespCtrlReprov): RespCtrlReprov;

    /**
     * Encodes the specified RespCtrlReprov message. Does not implicitly {@link RespCtrlReprov.verify|verify} messages.
     * @param message RespCtrlReprov message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespCtrlReprov, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespCtrlReprov message, length delimited. Does not implicitly {@link RespCtrlReprov.verify|verify} messages.
     * @param message RespCtrlReprov message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespCtrlReprov, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespCtrlReprov message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespCtrlReprov;

    /**
     * Decodes a RespCtrlReprov message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespCtrlReprov;

    /**
     * Verifies a RespCtrlReprov message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespCtrlReprov message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespCtrlReprov
     */
    public static fromObject(object: { [k: string]: any }): RespCtrlReprov;

    /**
     * Creates a plain object from a RespCtrlReprov message. Also converts values to other types if specified.
     * @param message RespCtrlReprov
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespCtrlReprov, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespCtrlReprov to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespCtrlReprov
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** WiFiCtrlMsgType enum. */
export enum WiFiCtrlMsgType {
    TypeCtrlReserved = 0,
    TypeCmdCtrlReset = 1,
    TypeRespCtrlReset = 2,
    TypeCmdCtrlReprov = 3,
    TypeRespCtrlReprov = 4
}

/** Represents a WiFiCtrlPayload. */
export class WiFiCtrlPayload implements IWiFiCtrlPayload {

    /**
     * Constructs a new WiFiCtrlPayload.
     * @param [properties] Properties to set
     */
    constructor(properties?: IWiFiCtrlPayload);

    /** WiFiCtrlPayload msg. */
    public msg: WiFiCtrlMsgType;

    /** WiFiCtrlPayload status. */
    public status: Status;

    /** WiFiCtrlPayload cmdCtrlReset. */
    public cmdCtrlReset?: (ICmdCtrlReset|null);

    /** WiFiCtrlPayload respCtrlReset. */
    public respCtrlReset?: (IRespCtrlReset|null);

    /** WiFiCtrlPayload cmdCtrlReprov. */
    public cmdCtrlReprov?: (ICmdCtrlReprov|null);

    /** WiFiCtrlPayload respCtrlReprov. */
    public respCtrlReprov?: (IRespCtrlReprov|null);

    /** WiFiCtrlPayload payload. */
    public payload?: ("cmdCtrlReset"|"respCtrlReset"|"cmdCtrlReprov"|"respCtrlReprov");

    /**
     * Creates a new WiFiCtrlPayload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WiFiCtrlPayload instance
     */
    public static create(properties?: IWiFiCtrlPayload): WiFiCtrlPayload;

    /**
     * Encodes the specified WiFiCtrlPayload message. Does not implicitly {@link WiFiCtrlPayload.verify|verify} messages.
     * @param message WiFiCtrlPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IWiFiCtrlPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WiFiCtrlPayload message, length delimited. Does not implicitly {@link WiFiCtrlPayload.verify|verify} messages.
     * @param message WiFiCtrlPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IWiFiCtrlPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WiFiCtrlPayload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns WiFiCtrlPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WiFiCtrlPayload;

    /**
     * Decodes a WiFiCtrlPayload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns WiFiCtrlPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WiFiCtrlPayload;

    /**
     * Verifies a WiFiCtrlPayload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WiFiCtrlPayload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WiFiCtrlPayload
     */
    public static fromObject(object: { [k: string]: any }): WiFiCtrlPayload;

    /**
     * Creates a plain object from a WiFiCtrlPayload message. Also converts values to other types if specified.
     * @param message WiFiCtrlPayload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: WiFiCtrlPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WiFiCtrlPayload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for WiFiCtrlPayload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdScanStart. */
export class CmdScanStart implements ICmdScanStart {

    /**
     * Constructs a new CmdScanStart.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdScanStart);

    /** CmdScanStart blocking. */
    public blocking: boolean;

    /** CmdScanStart passive. */
    public passive: boolean;

    /** CmdScanStart groupChannels. */
    public groupChannels: number;

    /** CmdScanStart periodMs. */
    public periodMs: number;

    /**
     * Creates a new CmdScanStart instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdScanStart instance
     */
    public static create(properties?: ICmdScanStart): CmdScanStart;

    /**
     * Encodes the specified CmdScanStart message. Does not implicitly {@link CmdScanStart.verify|verify} messages.
     * @param message CmdScanStart message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdScanStart, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdScanStart message, length delimited. Does not implicitly {@link CmdScanStart.verify|verify} messages.
     * @param message CmdScanStart message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdScanStart, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdScanStart message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdScanStart;

    /**
     * Decodes a CmdScanStart message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdScanStart;

    /**
     * Verifies a CmdScanStart message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdScanStart message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdScanStart
     */
    public static fromObject(object: { [k: string]: any }): CmdScanStart;

    /**
     * Creates a plain object from a CmdScanStart message. Also converts values to other types if specified.
     * @param message CmdScanStart
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdScanStart, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdScanStart to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdScanStart
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespScanStart. */
export class RespScanStart implements IRespScanStart {

    /**
     * Constructs a new RespScanStart.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespScanStart);

    /**
     * Creates a new RespScanStart instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespScanStart instance
     */
    public static create(properties?: IRespScanStart): RespScanStart;

    /**
     * Encodes the specified RespScanStart message. Does not implicitly {@link RespScanStart.verify|verify} messages.
     * @param message RespScanStart message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespScanStart, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespScanStart message, length delimited. Does not implicitly {@link RespScanStart.verify|verify} messages.
     * @param message RespScanStart message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespScanStart, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespScanStart message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespScanStart;

    /**
     * Decodes a RespScanStart message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespScanStart;

    /**
     * Verifies a RespScanStart message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespScanStart message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespScanStart
     */
    public static fromObject(object: { [k: string]: any }): RespScanStart;

    /**
     * Creates a plain object from a RespScanStart message. Also converts values to other types if specified.
     * @param message RespScanStart
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespScanStart, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespScanStart to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespScanStart
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdScanStatus. */
export class CmdScanStatus implements ICmdScanStatus {

    /**
     * Constructs a new CmdScanStatus.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdScanStatus);

    /**
     * Creates a new CmdScanStatus instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdScanStatus instance
     */
    public static create(properties?: ICmdScanStatus): CmdScanStatus;

    /**
     * Encodes the specified CmdScanStatus message. Does not implicitly {@link CmdScanStatus.verify|verify} messages.
     * @param message CmdScanStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdScanStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdScanStatus message, length delimited. Does not implicitly {@link CmdScanStatus.verify|verify} messages.
     * @param message CmdScanStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdScanStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdScanStatus message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdScanStatus;

    /**
     * Decodes a CmdScanStatus message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdScanStatus;

    /**
     * Verifies a CmdScanStatus message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdScanStatus message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdScanStatus
     */
    public static fromObject(object: { [k: string]: any }): CmdScanStatus;

    /**
     * Creates a plain object from a CmdScanStatus message. Also converts values to other types if specified.
     * @param message CmdScanStatus
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdScanStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdScanStatus to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdScanStatus
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespScanStatus. */
export class RespScanStatus implements IRespScanStatus {

    /**
     * Constructs a new RespScanStatus.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespScanStatus);

    /** RespScanStatus scanFinished. */
    public scanFinished: boolean;

    /** RespScanStatus resultCount. */
    public resultCount: number;

    /**
     * Creates a new RespScanStatus instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespScanStatus instance
     */
    public static create(properties?: IRespScanStatus): RespScanStatus;

    /**
     * Encodes the specified RespScanStatus message. Does not implicitly {@link RespScanStatus.verify|verify} messages.
     * @param message RespScanStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespScanStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespScanStatus message, length delimited. Does not implicitly {@link RespScanStatus.verify|verify} messages.
     * @param message RespScanStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespScanStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespScanStatus message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespScanStatus;

    /**
     * Decodes a RespScanStatus message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespScanStatus;

    /**
     * Verifies a RespScanStatus message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespScanStatus message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespScanStatus
     */
    public static fromObject(object: { [k: string]: any }): RespScanStatus;

    /**
     * Creates a plain object from a RespScanStatus message. Also converts values to other types if specified.
     * @param message RespScanStatus
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespScanStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespScanStatus to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespScanStatus
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CmdScanResult. */
export class CmdScanResult implements ICmdScanResult {

    /**
     * Constructs a new CmdScanResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICmdScanResult);

    /** CmdScanResult startIndex. */
    public startIndex: number;

    /** CmdScanResult count. */
    public count: number;

    /**
     * Creates a new CmdScanResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CmdScanResult instance
     */
    public static create(properties?: ICmdScanResult): CmdScanResult;

    /**
     * Encodes the specified CmdScanResult message. Does not implicitly {@link CmdScanResult.verify|verify} messages.
     * @param message CmdScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICmdScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CmdScanResult message, length delimited. Does not implicitly {@link CmdScanResult.verify|verify} messages.
     * @param message CmdScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICmdScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CmdScanResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CmdScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CmdScanResult;

    /**
     * Decodes a CmdScanResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CmdScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CmdScanResult;

    /**
     * Verifies a CmdScanResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CmdScanResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CmdScanResult
     */
    public static fromObject(object: { [k: string]: any }): CmdScanResult;

    /**
     * Creates a plain object from a CmdScanResult message. Also converts values to other types if specified.
     * @param message CmdScanResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CmdScanResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CmdScanResult to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CmdScanResult
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a WiFiScanResult. */
export class WiFiScanResult implements IWiFiScanResult {

    /**
     * Constructs a new WiFiScanResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: IWiFiScanResult);

    /** WiFiScanResult ssid. */
    public ssid: Uint8Array;

    /** WiFiScanResult channel. */
    public channel: number;

    /** WiFiScanResult rssi. */
    public rssi: number;

    /** WiFiScanResult bssid. */
    public bssid: Uint8Array;

    /** WiFiScanResult auth. */
    public auth: WifiAuthMode;

    /**
     * Creates a new WiFiScanResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WiFiScanResult instance
     */
    public static create(properties?: IWiFiScanResult): WiFiScanResult;

    /**
     * Encodes the specified WiFiScanResult message. Does not implicitly {@link WiFiScanResult.verify|verify} messages.
     * @param message WiFiScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IWiFiScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WiFiScanResult message, length delimited. Does not implicitly {@link WiFiScanResult.verify|verify} messages.
     * @param message WiFiScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IWiFiScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WiFiScanResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns WiFiScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WiFiScanResult;

    /**
     * Decodes a WiFiScanResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns WiFiScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WiFiScanResult;

    /**
     * Verifies a WiFiScanResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WiFiScanResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WiFiScanResult
     */
    public static fromObject(object: { [k: string]: any }): WiFiScanResult;

    /**
     * Creates a plain object from a WiFiScanResult message. Also converts values to other types if specified.
     * @param message WiFiScanResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: WiFiScanResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WiFiScanResult to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for WiFiScanResult
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RespScanResult. */
export class RespScanResult implements IRespScanResult {

    /**
     * Constructs a new RespScanResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRespScanResult);

    /** RespScanResult entries. */
    public entries: IWiFiScanResult[];

    /**
     * Creates a new RespScanResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RespScanResult instance
     */
    public static create(properties?: IRespScanResult): RespScanResult;

    /**
     * Encodes the specified RespScanResult message. Does not implicitly {@link RespScanResult.verify|verify} messages.
     * @param message RespScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRespScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RespScanResult message, length delimited. Does not implicitly {@link RespScanResult.verify|verify} messages.
     * @param message RespScanResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRespScanResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RespScanResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RespScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RespScanResult;

    /**
     * Decodes a RespScanResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RespScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RespScanResult;

    /**
     * Verifies a RespScanResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RespScanResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RespScanResult
     */
    public static fromObject(object: { [k: string]: any }): RespScanResult;

    /**
     * Creates a plain object from a RespScanResult message. Also converts values to other types if specified.
     * @param message RespScanResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RespScanResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RespScanResult to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RespScanResult
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** WiFiScanMsgType enum. */
export enum WiFiScanMsgType {
    TypeCmdScanStart = 0,
    TypeRespScanStart = 1,
    TypeCmdScanStatus = 2,
    TypeRespScanStatus = 3,
    TypeCmdScanResult = 4,
    TypeRespScanResult = 5
}

/** Represents a WiFiScanPayload. */
export class WiFiScanPayload implements IWiFiScanPayload {

    /**
     * Constructs a new WiFiScanPayload.
     * @param [properties] Properties to set
     */
    constructor(properties?: IWiFiScanPayload);

    /** WiFiScanPayload msg. */
    public msg: WiFiScanMsgType;

    /** WiFiScanPayload status. */
    public status: Status;

    /** WiFiScanPayload cmdScanStart. */
    public cmdScanStart?: (ICmdScanStart|null);

    /** WiFiScanPayload respScanStart. */
    public respScanStart?: (IRespScanStart|null);

    /** WiFiScanPayload cmdScanStatus. */
    public cmdScanStatus?: (ICmdScanStatus|null);

    /** WiFiScanPayload respScanStatus. */
    public respScanStatus?: (IRespScanStatus|null);

    /** WiFiScanPayload cmdScanResult. */
    public cmdScanResult?: (ICmdScanResult|null);

    /** WiFiScanPayload respScanResult. */
    public respScanResult?: (IRespScanResult|null);

    /** WiFiScanPayload payload. */
    public payload?: ("cmdScanStart"|"respScanStart"|"cmdScanStatus"|"respScanStatus"|"cmdScanResult"|"respScanResult");

    /**
     * Creates a new WiFiScanPayload instance using the specified properties.
     * @param [properties] Properties to set
     * @returns WiFiScanPayload instance
     */
    public static create(properties?: IWiFiScanPayload): WiFiScanPayload;

    /**
     * Encodes the specified WiFiScanPayload message. Does not implicitly {@link WiFiScanPayload.verify|verify} messages.
     * @param message WiFiScanPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IWiFiScanPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified WiFiScanPayload message, length delimited. Does not implicitly {@link WiFiScanPayload.verify|verify} messages.
     * @param message WiFiScanPayload message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IWiFiScanPayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a WiFiScanPayload message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns WiFiScanPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): WiFiScanPayload;

    /**
     * Decodes a WiFiScanPayload message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns WiFiScanPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): WiFiScanPayload;

    /**
     * Verifies a WiFiScanPayload message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a WiFiScanPayload message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns WiFiScanPayload
     */
    public static fromObject(object: { [k: string]: any }): WiFiScanPayload;

    /**
     * Creates a plain object from a WiFiScanPayload message. Also converts values to other types if specified.
     * @param message WiFiScanPayload
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: WiFiScanPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this WiFiScanPayload to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for WiFiScanPayload
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
