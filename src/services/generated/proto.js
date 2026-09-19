/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * Status enum.
 * @exports Status
 * @enum {number}
 * @property {number} Success=0 Success value
 * @property {number} InvalidSecScheme=1 InvalidSecScheme value
 * @property {number} InvalidProto=2 InvalidProto value
 * @property {number} TooManySessions=3 TooManySessions value
 * @property {number} InvalidArgument=4 InvalidArgument value
 * @property {number} InternalError=5 InternalError value
 * @property {number} CryptoError=6 CryptoError value
 * @property {number} InvalidSession=7 InvalidSession value
 */
export const Status = $root.Status = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Success"] = 0;
    values[valuesById[1] = "InvalidSecScheme"] = 1;
    values[valuesById[2] = "InvalidProto"] = 2;
    values[valuesById[3] = "TooManySessions"] = 3;
    values[valuesById[4] = "InvalidArgument"] = 4;
    values[valuesById[5] = "InternalError"] = 5;
    values[valuesById[6] = "CryptoError"] = 6;
    values[valuesById[7] = "InvalidSession"] = 7;
    return values;
})();

export const S0SessionCmd = $root.S0SessionCmd = (() => {

    /**
     * Properties of a S0SessionCmd.
     * @exports IS0SessionCmd
     * @interface IS0SessionCmd
     */

    /**
     * Constructs a new S0SessionCmd.
     * @exports S0SessionCmd
     * @classdesc Represents a S0SessionCmd.
     * @implements IS0SessionCmd
     * @constructor
     * @param {IS0SessionCmd=} [properties] Properties to set
     */
    function S0SessionCmd(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new S0SessionCmd instance using the specified properties.
     * @function create
     * @memberof S0SessionCmd
     * @static
     * @param {IS0SessionCmd=} [properties] Properties to set
     * @returns {S0SessionCmd} S0SessionCmd instance
     */
    S0SessionCmd.create = function create(properties) {
        return new S0SessionCmd(properties);
    };

    /**
     * Encodes the specified S0SessionCmd message. Does not implicitly {@link S0SessionCmd.verify|verify} messages.
     * @function encode
     * @memberof S0SessionCmd
     * @static
     * @param {IS0SessionCmd} message S0SessionCmd message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S0SessionCmd.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified S0SessionCmd message, length delimited. Does not implicitly {@link S0SessionCmd.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S0SessionCmd
     * @static
     * @param {IS0SessionCmd} message S0SessionCmd message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S0SessionCmd.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S0SessionCmd message from the specified reader or buffer.
     * @function decode
     * @memberof S0SessionCmd
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S0SessionCmd} S0SessionCmd
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S0SessionCmd.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S0SessionCmd();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S0SessionCmd message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S0SessionCmd
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S0SessionCmd} S0SessionCmd
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S0SessionCmd.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S0SessionCmd message.
     * @function verify
     * @memberof S0SessionCmd
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S0SessionCmd.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a S0SessionCmd message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S0SessionCmd
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S0SessionCmd} S0SessionCmd
     */
    S0SessionCmd.fromObject = function fromObject(object) {
        if (object instanceof $root.S0SessionCmd)
            return object;
        return new $root.S0SessionCmd();
    };

    /**
     * Creates a plain object from a S0SessionCmd message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S0SessionCmd
     * @static
     * @param {S0SessionCmd} message S0SessionCmd
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S0SessionCmd.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this S0SessionCmd to JSON.
     * @function toJSON
     * @memberof S0SessionCmd
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S0SessionCmd.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S0SessionCmd
     * @function getTypeUrl
     * @memberof S0SessionCmd
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S0SessionCmd.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S0SessionCmd";
    };

    return S0SessionCmd;
})();

export const S0SessionResp = $root.S0SessionResp = (() => {

    /**
     * Properties of a S0SessionResp.
     * @exports IS0SessionResp
     * @interface IS0SessionResp
     * @property {Status|null} [status] S0SessionResp status
     */

    /**
     * Constructs a new S0SessionResp.
     * @exports S0SessionResp
     * @classdesc Represents a S0SessionResp.
     * @implements IS0SessionResp
     * @constructor
     * @param {IS0SessionResp=} [properties] Properties to set
     */
    function S0SessionResp(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * S0SessionResp status.
     * @member {Status} status
     * @memberof S0SessionResp
     * @instance
     */
    S0SessionResp.prototype.status = 0;

    /**
     * Creates a new S0SessionResp instance using the specified properties.
     * @function create
     * @memberof S0SessionResp
     * @static
     * @param {IS0SessionResp=} [properties] Properties to set
     * @returns {S0SessionResp} S0SessionResp instance
     */
    S0SessionResp.create = function create(properties) {
        return new S0SessionResp(properties);
    };

    /**
     * Encodes the specified S0SessionResp message. Does not implicitly {@link S0SessionResp.verify|verify} messages.
     * @function encode
     * @memberof S0SessionResp
     * @static
     * @param {IS0SessionResp} message S0SessionResp message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S0SessionResp.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        return writer;
    };

    /**
     * Encodes the specified S0SessionResp message, length delimited. Does not implicitly {@link S0SessionResp.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S0SessionResp
     * @static
     * @param {IS0SessionResp} message S0SessionResp message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S0SessionResp.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S0SessionResp message from the specified reader or buffer.
     * @function decode
     * @memberof S0SessionResp
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S0SessionResp} S0SessionResp
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S0SessionResp.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S0SessionResp();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S0SessionResp message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S0SessionResp
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S0SessionResp} S0SessionResp
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S0SessionResp.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S0SessionResp message.
     * @function verify
     * @memberof S0SessionResp
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S0SessionResp.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        return null;
    };

    /**
     * Creates a S0SessionResp message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S0SessionResp
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S0SessionResp} S0SessionResp
     */
    S0SessionResp.fromObject = function fromObject(object) {
        if (object instanceof $root.S0SessionResp)
            return object;
        let message = new $root.S0SessionResp();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a S0SessionResp message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S0SessionResp
     * @static
     * @param {S0SessionResp} message S0SessionResp
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S0SessionResp.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.status = options.enums === String ? "Success" : 0;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        return object;
    };

    /**
     * Converts this S0SessionResp to JSON.
     * @function toJSON
     * @memberof S0SessionResp
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S0SessionResp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S0SessionResp
     * @function getTypeUrl
     * @memberof S0SessionResp
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S0SessionResp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S0SessionResp";
    };

    return S0SessionResp;
})();

/**
 * Sec0MsgType enum.
 * @exports Sec0MsgType
 * @enum {number}
 * @property {number} S0_Session_Command=0 S0_Session_Command value
 * @property {number} S0_Session_Response=1 S0_Session_Response value
 */
export const Sec0MsgType = $root.Sec0MsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "S0_Session_Command"] = 0;
    values[valuesById[1] = "S0_Session_Response"] = 1;
    return values;
})();

export const Sec0Payload = $root.Sec0Payload = (() => {

    /**
     * Properties of a Sec0Payload.
     * @exports ISec0Payload
     * @interface ISec0Payload
     * @property {Sec0MsgType|null} [msg] Sec0Payload msg
     * @property {IS0SessionCmd|null} [sc] Sec0Payload sc
     * @property {IS0SessionResp|null} [sr] Sec0Payload sr
     */

    /**
     * Constructs a new Sec0Payload.
     * @exports Sec0Payload
     * @classdesc Represents a Sec0Payload.
     * @implements ISec0Payload
     * @constructor
     * @param {ISec0Payload=} [properties] Properties to set
     */
    function Sec0Payload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Sec0Payload msg.
     * @member {Sec0MsgType} msg
     * @memberof Sec0Payload
     * @instance
     */
    Sec0Payload.prototype.msg = 0;

    /**
     * Sec0Payload sc.
     * @member {IS0SessionCmd|null|undefined} sc
     * @memberof Sec0Payload
     * @instance
     */
    Sec0Payload.prototype.sc = null;

    /**
     * Sec0Payload sr.
     * @member {IS0SessionResp|null|undefined} sr
     * @memberof Sec0Payload
     * @instance
     */
    Sec0Payload.prototype.sr = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Sec0Payload payload.
     * @member {"sc"|"sr"|undefined} payload
     * @memberof Sec0Payload
     * @instance
     */
    Object.defineProperty(Sec0Payload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["sc", "sr"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Sec0Payload instance using the specified properties.
     * @function create
     * @memberof Sec0Payload
     * @static
     * @param {ISec0Payload=} [properties] Properties to set
     * @returns {Sec0Payload} Sec0Payload instance
     */
    Sec0Payload.create = function create(properties) {
        return new Sec0Payload(properties);
    };

    /**
     * Encodes the specified Sec0Payload message. Does not implicitly {@link Sec0Payload.verify|verify} messages.
     * @function encode
     * @memberof Sec0Payload
     * @static
     * @param {ISec0Payload} message Sec0Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec0Payload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.sc != null && Object.hasOwnProperty.call(message, "sc"))
            $root.S0SessionCmd.encode(message.sc, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
        if (message.sr != null && Object.hasOwnProperty.call(message, "sr"))
            $root.S0SessionResp.encode(message.sr, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Sec0Payload message, length delimited. Does not implicitly {@link Sec0Payload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Sec0Payload
     * @static
     * @param {ISec0Payload} message Sec0Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec0Payload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Sec0Payload message from the specified reader or buffer.
     * @function decode
     * @memberof Sec0Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Sec0Payload} Sec0Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec0Payload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Sec0Payload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 20: {
                    message.sc = $root.S0SessionCmd.decode(reader, reader.uint32());
                    break;
                }
            case 21: {
                    message.sr = $root.S0SessionResp.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Sec0Payload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Sec0Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Sec0Payload} Sec0Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec0Payload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Sec0Payload message.
     * @function verify
     * @memberof Sec0Payload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Sec0Payload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
                break;
            }
        if (message.sc != null && message.hasOwnProperty("sc")) {
            properties.payload = 1;
            {
                let error = $root.S0SessionCmd.verify(message.sc);
                if (error)
                    return "sc." + error;
            }
        }
        if (message.sr != null && message.hasOwnProperty("sr")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.S0SessionResp.verify(message.sr);
                if (error)
                    return "sr." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Sec0Payload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Sec0Payload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Sec0Payload} Sec0Payload
     */
    Sec0Payload.fromObject = function fromObject(object) {
        if (object instanceof $root.Sec0Payload)
            return object;
        let message = new $root.Sec0Payload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "S0_Session_Command":
        case 0:
            message.msg = 0;
            break;
        case "S0_Session_Response":
        case 1:
            message.msg = 1;
            break;
        }
        if (object.sc != null) {
            if (typeof object.sc !== "object")
                throw TypeError(".Sec0Payload.sc: object expected");
            message.sc = $root.S0SessionCmd.fromObject(object.sc);
        }
        if (object.sr != null) {
            if (typeof object.sr !== "object")
                throw TypeError(".Sec0Payload.sr: object expected");
            message.sr = $root.S0SessionResp.fromObject(object.sr);
        }
        return message;
    };

    /**
     * Creates a plain object from a Sec0Payload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Sec0Payload
     * @static
     * @param {Sec0Payload} message Sec0Payload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Sec0Payload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.msg = options.enums === String ? "S0_Session_Command" : 0;
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.Sec0MsgType[message.msg] === undefined ? message.msg : $root.Sec0MsgType[message.msg] : message.msg;
        if (message.sc != null && message.hasOwnProperty("sc")) {
            object.sc = $root.S0SessionCmd.toObject(message.sc, options);
            if (options.oneofs)
                object.payload = "sc";
        }
        if (message.sr != null && message.hasOwnProperty("sr")) {
            object.sr = $root.S0SessionResp.toObject(message.sr, options);
            if (options.oneofs)
                object.payload = "sr";
        }
        return object;
    };

    /**
     * Converts this Sec0Payload to JSON.
     * @function toJSON
     * @memberof Sec0Payload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Sec0Payload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Sec0Payload
     * @function getTypeUrl
     * @memberof Sec0Payload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Sec0Payload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Sec0Payload";
    };

    return Sec0Payload;
})();

export const SessionCmd1 = $root.SessionCmd1 = (() => {

    /**
     * Properties of a SessionCmd1.
     * @exports ISessionCmd1
     * @interface ISessionCmd1
     * @property {Uint8Array|null} [clientVerifyData] SessionCmd1 clientVerifyData
     */

    /**
     * Constructs a new SessionCmd1.
     * @exports SessionCmd1
     * @classdesc Represents a SessionCmd1.
     * @implements ISessionCmd1
     * @constructor
     * @param {ISessionCmd1=} [properties] Properties to set
     */
    function SessionCmd1(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SessionCmd1 clientVerifyData.
     * @member {Uint8Array} clientVerifyData
     * @memberof SessionCmd1
     * @instance
     */
    SessionCmd1.prototype.clientVerifyData = $util.newBuffer([]);

    /**
     * Creates a new SessionCmd1 instance using the specified properties.
     * @function create
     * @memberof SessionCmd1
     * @static
     * @param {ISessionCmd1=} [properties] Properties to set
     * @returns {SessionCmd1} SessionCmd1 instance
     */
    SessionCmd1.create = function create(properties) {
        return new SessionCmd1(properties);
    };

    /**
     * Encodes the specified SessionCmd1 message. Does not implicitly {@link SessionCmd1.verify|verify} messages.
     * @function encode
     * @memberof SessionCmd1
     * @static
     * @param {ISessionCmd1} message SessionCmd1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionCmd1.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clientVerifyData != null && Object.hasOwnProperty.call(message, "clientVerifyData"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.clientVerifyData);
        return writer;
    };

    /**
     * Encodes the specified SessionCmd1 message, length delimited. Does not implicitly {@link SessionCmd1.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SessionCmd1
     * @static
     * @param {ISessionCmd1} message SessionCmd1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionCmd1.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SessionCmd1 message from the specified reader or buffer.
     * @function decode
     * @memberof SessionCmd1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SessionCmd1} SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionCmd1.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.SessionCmd1();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 2: {
                    message.clientVerifyData = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SessionCmd1 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SessionCmd1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SessionCmd1} SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionCmd1.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SessionCmd1 message.
     * @function verify
     * @memberof SessionCmd1
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SessionCmd1.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clientVerifyData != null && message.hasOwnProperty("clientVerifyData"))
            if (!(message.clientVerifyData && typeof message.clientVerifyData.length === "number" || $util.isString(message.clientVerifyData)))
                return "clientVerifyData: buffer expected";
        return null;
    };

    /**
     * Creates a SessionCmd1 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SessionCmd1
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SessionCmd1} SessionCmd1
     */
    SessionCmd1.fromObject = function fromObject(object) {
        if (object instanceof $root.SessionCmd1)
            return object;
        let message = new $root.SessionCmd1();
        if (object.clientVerifyData != null)
            if (typeof object.clientVerifyData === "string")
                $util.base64.decode(object.clientVerifyData, message.clientVerifyData = $util.newBuffer($util.base64.length(object.clientVerifyData)), 0);
            else if (object.clientVerifyData.length >= 0)
                message.clientVerifyData = object.clientVerifyData;
        return message;
    };

    /**
     * Creates a plain object from a SessionCmd1 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SessionCmd1
     * @static
     * @param {SessionCmd1} message SessionCmd1
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SessionCmd1.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            if (options.bytes === String)
                object.clientVerifyData = "";
            else {
                object.clientVerifyData = [];
                if (options.bytes !== Array)
                    object.clientVerifyData = $util.newBuffer(object.clientVerifyData);
            }
        if (message.clientVerifyData != null && message.hasOwnProperty("clientVerifyData"))
            object.clientVerifyData = options.bytes === String ? $util.base64.encode(message.clientVerifyData, 0, message.clientVerifyData.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientVerifyData) : message.clientVerifyData;
        return object;
    };

    /**
     * Converts this SessionCmd1 to JSON.
     * @function toJSON
     * @memberof SessionCmd1
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SessionCmd1.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SessionCmd1
     * @function getTypeUrl
     * @memberof SessionCmd1
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SessionCmd1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SessionCmd1";
    };

    return SessionCmd1;
})();

export const SessionResp1 = $root.SessionResp1 = (() => {

    /**
     * Properties of a SessionResp1.
     * @exports ISessionResp1
     * @interface ISessionResp1
     * @property {Status|null} [status] SessionResp1 status
     * @property {Uint8Array|null} [deviceVerifyData] SessionResp1 deviceVerifyData
     */

    /**
     * Constructs a new SessionResp1.
     * @exports SessionResp1
     * @classdesc Represents a SessionResp1.
     * @implements ISessionResp1
     * @constructor
     * @param {ISessionResp1=} [properties] Properties to set
     */
    function SessionResp1(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SessionResp1 status.
     * @member {Status} status
     * @memberof SessionResp1
     * @instance
     */
    SessionResp1.prototype.status = 0;

    /**
     * SessionResp1 deviceVerifyData.
     * @member {Uint8Array} deviceVerifyData
     * @memberof SessionResp1
     * @instance
     */
    SessionResp1.prototype.deviceVerifyData = $util.newBuffer([]);

    /**
     * Creates a new SessionResp1 instance using the specified properties.
     * @function create
     * @memberof SessionResp1
     * @static
     * @param {ISessionResp1=} [properties] Properties to set
     * @returns {SessionResp1} SessionResp1 instance
     */
    SessionResp1.create = function create(properties) {
        return new SessionResp1(properties);
    };

    /**
     * Encodes the specified SessionResp1 message. Does not implicitly {@link SessionResp1.verify|verify} messages.
     * @function encode
     * @memberof SessionResp1
     * @static
     * @param {ISessionResp1} message SessionResp1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionResp1.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        if (message.deviceVerifyData != null && Object.hasOwnProperty.call(message, "deviceVerifyData"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.deviceVerifyData);
        return writer;
    };

    /**
     * Encodes the specified SessionResp1 message, length delimited. Does not implicitly {@link SessionResp1.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SessionResp1
     * @static
     * @param {ISessionResp1} message SessionResp1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionResp1.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SessionResp1 message from the specified reader or buffer.
     * @function decode
     * @memberof SessionResp1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SessionResp1} SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionResp1.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.SessionResp1();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            case 3: {
                    message.deviceVerifyData = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SessionResp1 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SessionResp1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SessionResp1} SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionResp1.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SessionResp1 message.
     * @function verify
     * @memberof SessionResp1
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SessionResp1.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.deviceVerifyData != null && message.hasOwnProperty("deviceVerifyData"))
            if (!(message.deviceVerifyData && typeof message.deviceVerifyData.length === "number" || $util.isString(message.deviceVerifyData)))
                return "deviceVerifyData: buffer expected";
        return null;
    };

    /**
     * Creates a SessionResp1 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SessionResp1
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SessionResp1} SessionResp1
     */
    SessionResp1.fromObject = function fromObject(object) {
        if (object instanceof $root.SessionResp1)
            return object;
        let message = new $root.SessionResp1();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.deviceVerifyData != null)
            if (typeof object.deviceVerifyData === "string")
                $util.base64.decode(object.deviceVerifyData, message.deviceVerifyData = $util.newBuffer($util.base64.length(object.deviceVerifyData)), 0);
            else if (object.deviceVerifyData.length >= 0)
                message.deviceVerifyData = object.deviceVerifyData;
        return message;
    };

    /**
     * Creates a plain object from a SessionResp1 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SessionResp1
     * @static
     * @param {SessionResp1} message SessionResp1
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SessionResp1.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.status = options.enums === String ? "Success" : 0;
            if (options.bytes === String)
                object.deviceVerifyData = "";
            else {
                object.deviceVerifyData = [];
                if (options.bytes !== Array)
                    object.deviceVerifyData = $util.newBuffer(object.deviceVerifyData);
            }
        }
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.deviceVerifyData != null && message.hasOwnProperty("deviceVerifyData"))
            object.deviceVerifyData = options.bytes === String ? $util.base64.encode(message.deviceVerifyData, 0, message.deviceVerifyData.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceVerifyData) : message.deviceVerifyData;
        return object;
    };

    /**
     * Converts this SessionResp1 to JSON.
     * @function toJSON
     * @memberof SessionResp1
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SessionResp1.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SessionResp1
     * @function getTypeUrl
     * @memberof SessionResp1
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SessionResp1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SessionResp1";
    };

    return SessionResp1;
})();

export const SessionCmd0 = $root.SessionCmd0 = (() => {

    /**
     * Properties of a SessionCmd0.
     * @exports ISessionCmd0
     * @interface ISessionCmd0
     * @property {Uint8Array|null} [clientPubkey] SessionCmd0 clientPubkey
     */

    /**
     * Constructs a new SessionCmd0.
     * @exports SessionCmd0
     * @classdesc Represents a SessionCmd0.
     * @implements ISessionCmd0
     * @constructor
     * @param {ISessionCmd0=} [properties] Properties to set
     */
    function SessionCmd0(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SessionCmd0 clientPubkey.
     * @member {Uint8Array} clientPubkey
     * @memberof SessionCmd0
     * @instance
     */
    SessionCmd0.prototype.clientPubkey = $util.newBuffer([]);

    /**
     * Creates a new SessionCmd0 instance using the specified properties.
     * @function create
     * @memberof SessionCmd0
     * @static
     * @param {ISessionCmd0=} [properties] Properties to set
     * @returns {SessionCmd0} SessionCmd0 instance
     */
    SessionCmd0.create = function create(properties) {
        return new SessionCmd0(properties);
    };

    /**
     * Encodes the specified SessionCmd0 message. Does not implicitly {@link SessionCmd0.verify|verify} messages.
     * @function encode
     * @memberof SessionCmd0
     * @static
     * @param {ISessionCmd0} message SessionCmd0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionCmd0.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clientPubkey != null && Object.hasOwnProperty.call(message, "clientPubkey"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientPubkey);
        return writer;
    };

    /**
     * Encodes the specified SessionCmd0 message, length delimited. Does not implicitly {@link SessionCmd0.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SessionCmd0
     * @static
     * @param {ISessionCmd0} message SessionCmd0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionCmd0.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SessionCmd0 message from the specified reader or buffer.
     * @function decode
     * @memberof SessionCmd0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SessionCmd0} SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionCmd0.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.SessionCmd0();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.clientPubkey = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SessionCmd0 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SessionCmd0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SessionCmd0} SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionCmd0.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SessionCmd0 message.
     * @function verify
     * @memberof SessionCmd0
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SessionCmd0.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clientPubkey != null && message.hasOwnProperty("clientPubkey"))
            if (!(message.clientPubkey && typeof message.clientPubkey.length === "number" || $util.isString(message.clientPubkey)))
                return "clientPubkey: buffer expected";
        return null;
    };

    /**
     * Creates a SessionCmd0 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SessionCmd0
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SessionCmd0} SessionCmd0
     */
    SessionCmd0.fromObject = function fromObject(object) {
        if (object instanceof $root.SessionCmd0)
            return object;
        let message = new $root.SessionCmd0();
        if (object.clientPubkey != null)
            if (typeof object.clientPubkey === "string")
                $util.base64.decode(object.clientPubkey, message.clientPubkey = $util.newBuffer($util.base64.length(object.clientPubkey)), 0);
            else if (object.clientPubkey.length >= 0)
                message.clientPubkey = object.clientPubkey;
        return message;
    };

    /**
     * Creates a plain object from a SessionCmd0 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SessionCmd0
     * @static
     * @param {SessionCmd0} message SessionCmd0
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SessionCmd0.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            if (options.bytes === String)
                object.clientPubkey = "";
            else {
                object.clientPubkey = [];
                if (options.bytes !== Array)
                    object.clientPubkey = $util.newBuffer(object.clientPubkey);
            }
        if (message.clientPubkey != null && message.hasOwnProperty("clientPubkey"))
            object.clientPubkey = options.bytes === String ? $util.base64.encode(message.clientPubkey, 0, message.clientPubkey.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientPubkey) : message.clientPubkey;
        return object;
    };

    /**
     * Converts this SessionCmd0 to JSON.
     * @function toJSON
     * @memberof SessionCmd0
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SessionCmd0.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SessionCmd0
     * @function getTypeUrl
     * @memberof SessionCmd0
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SessionCmd0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SessionCmd0";
    };

    return SessionCmd0;
})();

export const SessionResp0 = $root.SessionResp0 = (() => {

    /**
     * Properties of a SessionResp0.
     * @exports ISessionResp0
     * @interface ISessionResp0
     * @property {Status|null} [status] SessionResp0 status
     * @property {Uint8Array|null} [devicePubkey] SessionResp0 devicePubkey
     * @property {Uint8Array|null} [deviceRandom] SessionResp0 deviceRandom
     */

    /**
     * Constructs a new SessionResp0.
     * @exports SessionResp0
     * @classdesc Represents a SessionResp0.
     * @implements ISessionResp0
     * @constructor
     * @param {ISessionResp0=} [properties] Properties to set
     */
    function SessionResp0(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SessionResp0 status.
     * @member {Status} status
     * @memberof SessionResp0
     * @instance
     */
    SessionResp0.prototype.status = 0;

    /**
     * SessionResp0 devicePubkey.
     * @member {Uint8Array} devicePubkey
     * @memberof SessionResp0
     * @instance
     */
    SessionResp0.prototype.devicePubkey = $util.newBuffer([]);

    /**
     * SessionResp0 deviceRandom.
     * @member {Uint8Array} deviceRandom
     * @memberof SessionResp0
     * @instance
     */
    SessionResp0.prototype.deviceRandom = $util.newBuffer([]);

    /**
     * Creates a new SessionResp0 instance using the specified properties.
     * @function create
     * @memberof SessionResp0
     * @static
     * @param {ISessionResp0=} [properties] Properties to set
     * @returns {SessionResp0} SessionResp0 instance
     */
    SessionResp0.create = function create(properties) {
        return new SessionResp0(properties);
    };

    /**
     * Encodes the specified SessionResp0 message. Does not implicitly {@link SessionResp0.verify|verify} messages.
     * @function encode
     * @memberof SessionResp0
     * @static
     * @param {ISessionResp0} message SessionResp0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionResp0.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        if (message.devicePubkey != null && Object.hasOwnProperty.call(message, "devicePubkey"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.devicePubkey);
        if (message.deviceRandom != null && Object.hasOwnProperty.call(message, "deviceRandom"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.deviceRandom);
        return writer;
    };

    /**
     * Encodes the specified SessionResp0 message, length delimited. Does not implicitly {@link SessionResp0.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SessionResp0
     * @static
     * @param {ISessionResp0} message SessionResp0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionResp0.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SessionResp0 message from the specified reader or buffer.
     * @function decode
     * @memberof SessionResp0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SessionResp0} SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionResp0.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.SessionResp0();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            case 2: {
                    message.devicePubkey = reader.bytes();
                    break;
                }
            case 3: {
                    message.deviceRandom = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SessionResp0 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SessionResp0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SessionResp0} SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionResp0.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SessionResp0 message.
     * @function verify
     * @memberof SessionResp0
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SessionResp0.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.devicePubkey != null && message.hasOwnProperty("devicePubkey"))
            if (!(message.devicePubkey && typeof message.devicePubkey.length === "number" || $util.isString(message.devicePubkey)))
                return "devicePubkey: buffer expected";
        if (message.deviceRandom != null && message.hasOwnProperty("deviceRandom"))
            if (!(message.deviceRandom && typeof message.deviceRandom.length === "number" || $util.isString(message.deviceRandom)))
                return "deviceRandom: buffer expected";
        return null;
    };

    /**
     * Creates a SessionResp0 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SessionResp0
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SessionResp0} SessionResp0
     */
    SessionResp0.fromObject = function fromObject(object) {
        if (object instanceof $root.SessionResp0)
            return object;
        let message = new $root.SessionResp0();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.devicePubkey != null)
            if (typeof object.devicePubkey === "string")
                $util.base64.decode(object.devicePubkey, message.devicePubkey = $util.newBuffer($util.base64.length(object.devicePubkey)), 0);
            else if (object.devicePubkey.length >= 0)
                message.devicePubkey = object.devicePubkey;
        if (object.deviceRandom != null)
            if (typeof object.deviceRandom === "string")
                $util.base64.decode(object.deviceRandom, message.deviceRandom = $util.newBuffer($util.base64.length(object.deviceRandom)), 0);
            else if (object.deviceRandom.length >= 0)
                message.deviceRandom = object.deviceRandom;
        return message;
    };

    /**
     * Creates a plain object from a SessionResp0 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SessionResp0
     * @static
     * @param {SessionResp0} message SessionResp0
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SessionResp0.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.status = options.enums === String ? "Success" : 0;
            if (options.bytes === String)
                object.devicePubkey = "";
            else {
                object.devicePubkey = [];
                if (options.bytes !== Array)
                    object.devicePubkey = $util.newBuffer(object.devicePubkey);
            }
            if (options.bytes === String)
                object.deviceRandom = "";
            else {
                object.deviceRandom = [];
                if (options.bytes !== Array)
                    object.deviceRandom = $util.newBuffer(object.deviceRandom);
            }
        }
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.devicePubkey != null && message.hasOwnProperty("devicePubkey"))
            object.devicePubkey = options.bytes === String ? $util.base64.encode(message.devicePubkey, 0, message.devicePubkey.length) : options.bytes === Array ? Array.prototype.slice.call(message.devicePubkey) : message.devicePubkey;
        if (message.deviceRandom != null && message.hasOwnProperty("deviceRandom"))
            object.deviceRandom = options.bytes === String ? $util.base64.encode(message.deviceRandom, 0, message.deviceRandom.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceRandom) : message.deviceRandom;
        return object;
    };

    /**
     * Converts this SessionResp0 to JSON.
     * @function toJSON
     * @memberof SessionResp0
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SessionResp0.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SessionResp0
     * @function getTypeUrl
     * @memberof SessionResp0
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SessionResp0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SessionResp0";
    };

    return SessionResp0;
})();

/**
 * Sec1MsgType enum.
 * @exports Sec1MsgType
 * @enum {number}
 * @property {number} Session_Command0=0 Session_Command0 value
 * @property {number} Session_Response0=1 Session_Response0 value
 * @property {number} Session_Command1=2 Session_Command1 value
 * @property {number} Session_Response1=3 Session_Response1 value
 */
export const Sec1MsgType = $root.Sec1MsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Session_Command0"] = 0;
    values[valuesById[1] = "Session_Response0"] = 1;
    values[valuesById[2] = "Session_Command1"] = 2;
    values[valuesById[3] = "Session_Response1"] = 3;
    return values;
})();

export const Sec1Payload = $root.Sec1Payload = (() => {

    /**
     * Properties of a Sec1Payload.
     * @exports ISec1Payload
     * @interface ISec1Payload
     * @property {Sec1MsgType|null} [msg] Sec1Payload msg
     * @property {ISessionCmd0|null} [sc0] Sec1Payload sc0
     * @property {ISessionResp0|null} [sr0] Sec1Payload sr0
     * @property {ISessionCmd1|null} [sc1] Sec1Payload sc1
     * @property {ISessionResp1|null} [sr1] Sec1Payload sr1
     */

    /**
     * Constructs a new Sec1Payload.
     * @exports Sec1Payload
     * @classdesc Represents a Sec1Payload.
     * @implements ISec1Payload
     * @constructor
     * @param {ISec1Payload=} [properties] Properties to set
     */
    function Sec1Payload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Sec1Payload msg.
     * @member {Sec1MsgType} msg
     * @memberof Sec1Payload
     * @instance
     */
    Sec1Payload.prototype.msg = 0;

    /**
     * Sec1Payload sc0.
     * @member {ISessionCmd0|null|undefined} sc0
     * @memberof Sec1Payload
     * @instance
     */
    Sec1Payload.prototype.sc0 = null;

    /**
     * Sec1Payload sr0.
     * @member {ISessionResp0|null|undefined} sr0
     * @memberof Sec1Payload
     * @instance
     */
    Sec1Payload.prototype.sr0 = null;

    /**
     * Sec1Payload sc1.
     * @member {ISessionCmd1|null|undefined} sc1
     * @memberof Sec1Payload
     * @instance
     */
    Sec1Payload.prototype.sc1 = null;

    /**
     * Sec1Payload sr1.
     * @member {ISessionResp1|null|undefined} sr1
     * @memberof Sec1Payload
     * @instance
     */
    Sec1Payload.prototype.sr1 = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Sec1Payload payload.
     * @member {"sc0"|"sr0"|"sc1"|"sr1"|undefined} payload
     * @memberof Sec1Payload
     * @instance
     */
    Object.defineProperty(Sec1Payload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["sc0", "sr0", "sc1", "sr1"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Sec1Payload instance using the specified properties.
     * @function create
     * @memberof Sec1Payload
     * @static
     * @param {ISec1Payload=} [properties] Properties to set
     * @returns {Sec1Payload} Sec1Payload instance
     */
    Sec1Payload.create = function create(properties) {
        return new Sec1Payload(properties);
    };

    /**
     * Encodes the specified Sec1Payload message. Does not implicitly {@link Sec1Payload.verify|verify} messages.
     * @function encode
     * @memberof Sec1Payload
     * @static
     * @param {ISec1Payload} message Sec1Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec1Payload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.sc0 != null && Object.hasOwnProperty.call(message, "sc0"))
            $root.SessionCmd0.encode(message.sc0, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
        if (message.sr0 != null && Object.hasOwnProperty.call(message, "sr0"))
            $root.SessionResp0.encode(message.sr0, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
        if (message.sc1 != null && Object.hasOwnProperty.call(message, "sc1"))
            $root.SessionCmd1.encode(message.sc1, writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
        if (message.sr1 != null && Object.hasOwnProperty.call(message, "sr1"))
            $root.SessionResp1.encode(message.sr1, writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Sec1Payload message, length delimited. Does not implicitly {@link Sec1Payload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Sec1Payload
     * @static
     * @param {ISec1Payload} message Sec1Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec1Payload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Sec1Payload message from the specified reader or buffer.
     * @function decode
     * @memberof Sec1Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Sec1Payload} Sec1Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec1Payload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Sec1Payload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 20: {
                    message.sc0 = $root.SessionCmd0.decode(reader, reader.uint32());
                    break;
                }
            case 21: {
                    message.sr0 = $root.SessionResp0.decode(reader, reader.uint32());
                    break;
                }
            case 22: {
                    message.sc1 = $root.SessionCmd1.decode(reader, reader.uint32());
                    break;
                }
            case 23: {
                    message.sr1 = $root.SessionResp1.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Sec1Payload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Sec1Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Sec1Payload} Sec1Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec1Payload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Sec1Payload message.
     * @function verify
     * @memberof Sec1Payload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Sec1Payload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.sc0 != null && message.hasOwnProperty("sc0")) {
            properties.payload = 1;
            {
                let error = $root.SessionCmd0.verify(message.sc0);
                if (error)
                    return "sc0." + error;
            }
        }
        if (message.sr0 != null && message.hasOwnProperty("sr0")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.SessionResp0.verify(message.sr0);
                if (error)
                    return "sr0." + error;
            }
        }
        if (message.sc1 != null && message.hasOwnProperty("sc1")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.SessionCmd1.verify(message.sc1);
                if (error)
                    return "sc1." + error;
            }
        }
        if (message.sr1 != null && message.hasOwnProperty("sr1")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.SessionResp1.verify(message.sr1);
                if (error)
                    return "sr1." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Sec1Payload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Sec1Payload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Sec1Payload} Sec1Payload
     */
    Sec1Payload.fromObject = function fromObject(object) {
        if (object instanceof $root.Sec1Payload)
            return object;
        let message = new $root.Sec1Payload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "Session_Command0":
        case 0:
            message.msg = 0;
            break;
        case "Session_Response0":
        case 1:
            message.msg = 1;
            break;
        case "Session_Command1":
        case 2:
            message.msg = 2;
            break;
        case "Session_Response1":
        case 3:
            message.msg = 3;
            break;
        }
        if (object.sc0 != null) {
            if (typeof object.sc0 !== "object")
                throw TypeError(".Sec1Payload.sc0: object expected");
            message.sc0 = $root.SessionCmd0.fromObject(object.sc0);
        }
        if (object.sr0 != null) {
            if (typeof object.sr0 !== "object")
                throw TypeError(".Sec1Payload.sr0: object expected");
            message.sr0 = $root.SessionResp0.fromObject(object.sr0);
        }
        if (object.sc1 != null) {
            if (typeof object.sc1 !== "object")
                throw TypeError(".Sec1Payload.sc1: object expected");
            message.sc1 = $root.SessionCmd1.fromObject(object.sc1);
        }
        if (object.sr1 != null) {
            if (typeof object.sr1 !== "object")
                throw TypeError(".Sec1Payload.sr1: object expected");
            message.sr1 = $root.SessionResp1.fromObject(object.sr1);
        }
        return message;
    };

    /**
     * Creates a plain object from a Sec1Payload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Sec1Payload
     * @static
     * @param {Sec1Payload} message Sec1Payload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Sec1Payload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.msg = options.enums === String ? "Session_Command0" : 0;
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.Sec1MsgType[message.msg] === undefined ? message.msg : $root.Sec1MsgType[message.msg] : message.msg;
        if (message.sc0 != null && message.hasOwnProperty("sc0")) {
            object.sc0 = $root.SessionCmd0.toObject(message.sc0, options);
            if (options.oneofs)
                object.payload = "sc0";
        }
        if (message.sr0 != null && message.hasOwnProperty("sr0")) {
            object.sr0 = $root.SessionResp0.toObject(message.sr0, options);
            if (options.oneofs)
                object.payload = "sr0";
        }
        if (message.sc1 != null && message.hasOwnProperty("sc1")) {
            object.sc1 = $root.SessionCmd1.toObject(message.sc1, options);
            if (options.oneofs)
                object.payload = "sc1";
        }
        if (message.sr1 != null && message.hasOwnProperty("sr1")) {
            object.sr1 = $root.SessionResp1.toObject(message.sr1, options);
            if (options.oneofs)
                object.payload = "sr1";
        }
        return object;
    };

    /**
     * Converts this Sec1Payload to JSON.
     * @function toJSON
     * @memberof Sec1Payload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Sec1Payload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Sec1Payload
     * @function getTypeUrl
     * @memberof Sec1Payload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Sec1Payload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Sec1Payload";
    };

    return Sec1Payload;
})();

/**
 * Sec2MsgType enum.
 * @exports Sec2MsgType
 * @enum {number}
 * @property {number} S2Session_Command0=0 S2Session_Command0 value
 * @property {number} S2Session_Response0=1 S2Session_Response0 value
 * @property {number} S2Session_Command1=2 S2Session_Command1 value
 * @property {number} S2Session_Response1=3 S2Session_Response1 value
 */
export const Sec2MsgType = $root.Sec2MsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "S2Session_Command0"] = 0;
    values[valuesById[1] = "S2Session_Response0"] = 1;
    values[valuesById[2] = "S2Session_Command1"] = 2;
    values[valuesById[3] = "S2Session_Response1"] = 3;
    return values;
})();

export const S2SessionCmd0 = $root.S2SessionCmd0 = (() => {

    /**
     * Properties of a S2SessionCmd0.
     * @exports IS2SessionCmd0
     * @interface IS2SessionCmd0
     * @property {Uint8Array|null} [clientUsername] S2SessionCmd0 clientUsername
     * @property {Uint8Array|null} [clientPubkey] S2SessionCmd0 clientPubkey
     */

    /**
     * Constructs a new S2SessionCmd0.
     * @exports S2SessionCmd0
     * @classdesc Represents a S2SessionCmd0.
     * @implements IS2SessionCmd0
     * @constructor
     * @param {IS2SessionCmd0=} [properties] Properties to set
     */
    function S2SessionCmd0(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * S2SessionCmd0 clientUsername.
     * @member {Uint8Array} clientUsername
     * @memberof S2SessionCmd0
     * @instance
     */
    S2SessionCmd0.prototype.clientUsername = $util.newBuffer([]);

    /**
     * S2SessionCmd0 clientPubkey.
     * @member {Uint8Array} clientPubkey
     * @memberof S2SessionCmd0
     * @instance
     */
    S2SessionCmd0.prototype.clientPubkey = $util.newBuffer([]);

    /**
     * Creates a new S2SessionCmd0 instance using the specified properties.
     * @function create
     * @memberof S2SessionCmd0
     * @static
     * @param {IS2SessionCmd0=} [properties] Properties to set
     * @returns {S2SessionCmd0} S2SessionCmd0 instance
     */
    S2SessionCmd0.create = function create(properties) {
        return new S2SessionCmd0(properties);
    };

    /**
     * Encodes the specified S2SessionCmd0 message. Does not implicitly {@link S2SessionCmd0.verify|verify} messages.
     * @function encode
     * @memberof S2SessionCmd0
     * @static
     * @param {IS2SessionCmd0} message S2SessionCmd0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionCmd0.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clientUsername != null && Object.hasOwnProperty.call(message, "clientUsername"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientUsername);
        if (message.clientPubkey != null && Object.hasOwnProperty.call(message, "clientPubkey"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.clientPubkey);
        return writer;
    };

    /**
     * Encodes the specified S2SessionCmd0 message, length delimited. Does not implicitly {@link S2SessionCmd0.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S2SessionCmd0
     * @static
     * @param {IS2SessionCmd0} message S2SessionCmd0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionCmd0.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S2SessionCmd0 message from the specified reader or buffer.
     * @function decode
     * @memberof S2SessionCmd0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S2SessionCmd0} S2SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionCmd0.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S2SessionCmd0();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.clientUsername = reader.bytes();
                    break;
                }
            case 2: {
                    message.clientPubkey = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S2SessionCmd0 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S2SessionCmd0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S2SessionCmd0} S2SessionCmd0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionCmd0.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S2SessionCmd0 message.
     * @function verify
     * @memberof S2SessionCmd0
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S2SessionCmd0.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clientUsername != null && message.hasOwnProperty("clientUsername"))
            if (!(message.clientUsername && typeof message.clientUsername.length === "number" || $util.isString(message.clientUsername)))
                return "clientUsername: buffer expected";
        if (message.clientPubkey != null && message.hasOwnProperty("clientPubkey"))
            if (!(message.clientPubkey && typeof message.clientPubkey.length === "number" || $util.isString(message.clientPubkey)))
                return "clientPubkey: buffer expected";
        return null;
    };

    /**
     * Creates a S2SessionCmd0 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S2SessionCmd0
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S2SessionCmd0} S2SessionCmd0
     */
    S2SessionCmd0.fromObject = function fromObject(object) {
        if (object instanceof $root.S2SessionCmd0)
            return object;
        let message = new $root.S2SessionCmd0();
        if (object.clientUsername != null)
            if (typeof object.clientUsername === "string")
                $util.base64.decode(object.clientUsername, message.clientUsername = $util.newBuffer($util.base64.length(object.clientUsername)), 0);
            else if (object.clientUsername.length >= 0)
                message.clientUsername = object.clientUsername;
        if (object.clientPubkey != null)
            if (typeof object.clientPubkey === "string")
                $util.base64.decode(object.clientPubkey, message.clientPubkey = $util.newBuffer($util.base64.length(object.clientPubkey)), 0);
            else if (object.clientPubkey.length >= 0)
                message.clientPubkey = object.clientPubkey;
        return message;
    };

    /**
     * Creates a plain object from a S2SessionCmd0 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S2SessionCmd0
     * @static
     * @param {S2SessionCmd0} message S2SessionCmd0
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S2SessionCmd0.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.clientUsername = "";
            else {
                object.clientUsername = [];
                if (options.bytes !== Array)
                    object.clientUsername = $util.newBuffer(object.clientUsername);
            }
            if (options.bytes === String)
                object.clientPubkey = "";
            else {
                object.clientPubkey = [];
                if (options.bytes !== Array)
                    object.clientPubkey = $util.newBuffer(object.clientPubkey);
            }
        }
        if (message.clientUsername != null && message.hasOwnProperty("clientUsername"))
            object.clientUsername = options.bytes === String ? $util.base64.encode(message.clientUsername, 0, message.clientUsername.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientUsername) : message.clientUsername;
        if (message.clientPubkey != null && message.hasOwnProperty("clientPubkey"))
            object.clientPubkey = options.bytes === String ? $util.base64.encode(message.clientPubkey, 0, message.clientPubkey.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientPubkey) : message.clientPubkey;
        return object;
    };

    /**
     * Converts this S2SessionCmd0 to JSON.
     * @function toJSON
     * @memberof S2SessionCmd0
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S2SessionCmd0.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S2SessionCmd0
     * @function getTypeUrl
     * @memberof S2SessionCmd0
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S2SessionCmd0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S2SessionCmd0";
    };

    return S2SessionCmd0;
})();

export const S2SessionResp0 = $root.S2SessionResp0 = (() => {

    /**
     * Properties of a S2SessionResp0.
     * @exports IS2SessionResp0
     * @interface IS2SessionResp0
     * @property {Status|null} [status] S2SessionResp0 status
     * @property {Uint8Array|null} [devicePubkey] S2SessionResp0 devicePubkey
     * @property {Uint8Array|null} [deviceSalt] S2SessionResp0 deviceSalt
     */

    /**
     * Constructs a new S2SessionResp0.
     * @exports S2SessionResp0
     * @classdesc Represents a S2SessionResp0.
     * @implements IS2SessionResp0
     * @constructor
     * @param {IS2SessionResp0=} [properties] Properties to set
     */
    function S2SessionResp0(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * S2SessionResp0 status.
     * @member {Status} status
     * @memberof S2SessionResp0
     * @instance
     */
    S2SessionResp0.prototype.status = 0;

    /**
     * S2SessionResp0 devicePubkey.
     * @member {Uint8Array} devicePubkey
     * @memberof S2SessionResp0
     * @instance
     */
    S2SessionResp0.prototype.devicePubkey = $util.newBuffer([]);

    /**
     * S2SessionResp0 deviceSalt.
     * @member {Uint8Array} deviceSalt
     * @memberof S2SessionResp0
     * @instance
     */
    S2SessionResp0.prototype.deviceSalt = $util.newBuffer([]);

    /**
     * Creates a new S2SessionResp0 instance using the specified properties.
     * @function create
     * @memberof S2SessionResp0
     * @static
     * @param {IS2SessionResp0=} [properties] Properties to set
     * @returns {S2SessionResp0} S2SessionResp0 instance
     */
    S2SessionResp0.create = function create(properties) {
        return new S2SessionResp0(properties);
    };

    /**
     * Encodes the specified S2SessionResp0 message. Does not implicitly {@link S2SessionResp0.verify|verify} messages.
     * @function encode
     * @memberof S2SessionResp0
     * @static
     * @param {IS2SessionResp0} message S2SessionResp0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionResp0.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        if (message.devicePubkey != null && Object.hasOwnProperty.call(message, "devicePubkey"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.devicePubkey);
        if (message.deviceSalt != null && Object.hasOwnProperty.call(message, "deviceSalt"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.deviceSalt);
        return writer;
    };

    /**
     * Encodes the specified S2SessionResp0 message, length delimited. Does not implicitly {@link S2SessionResp0.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S2SessionResp0
     * @static
     * @param {IS2SessionResp0} message S2SessionResp0 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionResp0.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S2SessionResp0 message from the specified reader or buffer.
     * @function decode
     * @memberof S2SessionResp0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S2SessionResp0} S2SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionResp0.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S2SessionResp0();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            case 2: {
                    message.devicePubkey = reader.bytes();
                    break;
                }
            case 3: {
                    message.deviceSalt = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S2SessionResp0 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S2SessionResp0
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S2SessionResp0} S2SessionResp0
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionResp0.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S2SessionResp0 message.
     * @function verify
     * @memberof S2SessionResp0
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S2SessionResp0.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.devicePubkey != null && message.hasOwnProperty("devicePubkey"))
            if (!(message.devicePubkey && typeof message.devicePubkey.length === "number" || $util.isString(message.devicePubkey)))
                return "devicePubkey: buffer expected";
        if (message.deviceSalt != null && message.hasOwnProperty("deviceSalt"))
            if (!(message.deviceSalt && typeof message.deviceSalt.length === "number" || $util.isString(message.deviceSalt)))
                return "deviceSalt: buffer expected";
        return null;
    };

    /**
     * Creates a S2SessionResp0 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S2SessionResp0
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S2SessionResp0} S2SessionResp0
     */
    S2SessionResp0.fromObject = function fromObject(object) {
        if (object instanceof $root.S2SessionResp0)
            return object;
        let message = new $root.S2SessionResp0();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.devicePubkey != null)
            if (typeof object.devicePubkey === "string")
                $util.base64.decode(object.devicePubkey, message.devicePubkey = $util.newBuffer($util.base64.length(object.devicePubkey)), 0);
            else if (object.devicePubkey.length >= 0)
                message.devicePubkey = object.devicePubkey;
        if (object.deviceSalt != null)
            if (typeof object.deviceSalt === "string")
                $util.base64.decode(object.deviceSalt, message.deviceSalt = $util.newBuffer($util.base64.length(object.deviceSalt)), 0);
            else if (object.deviceSalt.length >= 0)
                message.deviceSalt = object.deviceSalt;
        return message;
    };

    /**
     * Creates a plain object from a S2SessionResp0 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S2SessionResp0
     * @static
     * @param {S2SessionResp0} message S2SessionResp0
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S2SessionResp0.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.status = options.enums === String ? "Success" : 0;
            if (options.bytes === String)
                object.devicePubkey = "";
            else {
                object.devicePubkey = [];
                if (options.bytes !== Array)
                    object.devicePubkey = $util.newBuffer(object.devicePubkey);
            }
            if (options.bytes === String)
                object.deviceSalt = "";
            else {
                object.deviceSalt = [];
                if (options.bytes !== Array)
                    object.deviceSalt = $util.newBuffer(object.deviceSalt);
            }
        }
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.devicePubkey != null && message.hasOwnProperty("devicePubkey"))
            object.devicePubkey = options.bytes === String ? $util.base64.encode(message.devicePubkey, 0, message.devicePubkey.length) : options.bytes === Array ? Array.prototype.slice.call(message.devicePubkey) : message.devicePubkey;
        if (message.deviceSalt != null && message.hasOwnProperty("deviceSalt"))
            object.deviceSalt = options.bytes === String ? $util.base64.encode(message.deviceSalt, 0, message.deviceSalt.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceSalt) : message.deviceSalt;
        return object;
    };

    /**
     * Converts this S2SessionResp0 to JSON.
     * @function toJSON
     * @memberof S2SessionResp0
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S2SessionResp0.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S2SessionResp0
     * @function getTypeUrl
     * @memberof S2SessionResp0
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S2SessionResp0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S2SessionResp0";
    };

    return S2SessionResp0;
})();

export const S2SessionCmd1 = $root.S2SessionCmd1 = (() => {

    /**
     * Properties of a S2SessionCmd1.
     * @exports IS2SessionCmd1
     * @interface IS2SessionCmd1
     * @property {Uint8Array|null} [clientProof] S2SessionCmd1 clientProof
     */

    /**
     * Constructs a new S2SessionCmd1.
     * @exports S2SessionCmd1
     * @classdesc Represents a S2SessionCmd1.
     * @implements IS2SessionCmd1
     * @constructor
     * @param {IS2SessionCmd1=} [properties] Properties to set
     */
    function S2SessionCmd1(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * S2SessionCmd1 clientProof.
     * @member {Uint8Array} clientProof
     * @memberof S2SessionCmd1
     * @instance
     */
    S2SessionCmd1.prototype.clientProof = $util.newBuffer([]);

    /**
     * Creates a new S2SessionCmd1 instance using the specified properties.
     * @function create
     * @memberof S2SessionCmd1
     * @static
     * @param {IS2SessionCmd1=} [properties] Properties to set
     * @returns {S2SessionCmd1} S2SessionCmd1 instance
     */
    S2SessionCmd1.create = function create(properties) {
        return new S2SessionCmd1(properties);
    };

    /**
     * Encodes the specified S2SessionCmd1 message. Does not implicitly {@link S2SessionCmd1.verify|verify} messages.
     * @function encode
     * @memberof S2SessionCmd1
     * @static
     * @param {IS2SessionCmd1} message S2SessionCmd1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionCmd1.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clientProof != null && Object.hasOwnProperty.call(message, "clientProof"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientProof);
        return writer;
    };

    /**
     * Encodes the specified S2SessionCmd1 message, length delimited. Does not implicitly {@link S2SessionCmd1.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S2SessionCmd1
     * @static
     * @param {IS2SessionCmd1} message S2SessionCmd1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionCmd1.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S2SessionCmd1 message from the specified reader or buffer.
     * @function decode
     * @memberof S2SessionCmd1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S2SessionCmd1} S2SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionCmd1.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S2SessionCmd1();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.clientProof = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S2SessionCmd1 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S2SessionCmd1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S2SessionCmd1} S2SessionCmd1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionCmd1.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S2SessionCmd1 message.
     * @function verify
     * @memberof S2SessionCmd1
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S2SessionCmd1.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clientProof != null && message.hasOwnProperty("clientProof"))
            if (!(message.clientProof && typeof message.clientProof.length === "number" || $util.isString(message.clientProof)))
                return "clientProof: buffer expected";
        return null;
    };

    /**
     * Creates a S2SessionCmd1 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S2SessionCmd1
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S2SessionCmd1} S2SessionCmd1
     */
    S2SessionCmd1.fromObject = function fromObject(object) {
        if (object instanceof $root.S2SessionCmd1)
            return object;
        let message = new $root.S2SessionCmd1();
        if (object.clientProof != null)
            if (typeof object.clientProof === "string")
                $util.base64.decode(object.clientProof, message.clientProof = $util.newBuffer($util.base64.length(object.clientProof)), 0);
            else if (object.clientProof.length >= 0)
                message.clientProof = object.clientProof;
        return message;
    };

    /**
     * Creates a plain object from a S2SessionCmd1 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S2SessionCmd1
     * @static
     * @param {S2SessionCmd1} message S2SessionCmd1
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S2SessionCmd1.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            if (options.bytes === String)
                object.clientProof = "";
            else {
                object.clientProof = [];
                if (options.bytes !== Array)
                    object.clientProof = $util.newBuffer(object.clientProof);
            }
        if (message.clientProof != null && message.hasOwnProperty("clientProof"))
            object.clientProof = options.bytes === String ? $util.base64.encode(message.clientProof, 0, message.clientProof.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientProof) : message.clientProof;
        return object;
    };

    /**
     * Converts this S2SessionCmd1 to JSON.
     * @function toJSON
     * @memberof S2SessionCmd1
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S2SessionCmd1.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S2SessionCmd1
     * @function getTypeUrl
     * @memberof S2SessionCmd1
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S2SessionCmd1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S2SessionCmd1";
    };

    return S2SessionCmd1;
})();

export const S2SessionResp1 = $root.S2SessionResp1 = (() => {

    /**
     * Properties of a S2SessionResp1.
     * @exports IS2SessionResp1
     * @interface IS2SessionResp1
     * @property {Status|null} [status] S2SessionResp1 status
     * @property {Uint8Array|null} [deviceProof] S2SessionResp1 deviceProof
     * @property {Uint8Array|null} [deviceNonce] S2SessionResp1 deviceNonce
     */

    /**
     * Constructs a new S2SessionResp1.
     * @exports S2SessionResp1
     * @classdesc Represents a S2SessionResp1.
     * @implements IS2SessionResp1
     * @constructor
     * @param {IS2SessionResp1=} [properties] Properties to set
     */
    function S2SessionResp1(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * S2SessionResp1 status.
     * @member {Status} status
     * @memberof S2SessionResp1
     * @instance
     */
    S2SessionResp1.prototype.status = 0;

    /**
     * S2SessionResp1 deviceProof.
     * @member {Uint8Array} deviceProof
     * @memberof S2SessionResp1
     * @instance
     */
    S2SessionResp1.prototype.deviceProof = $util.newBuffer([]);

    /**
     * S2SessionResp1 deviceNonce.
     * @member {Uint8Array} deviceNonce
     * @memberof S2SessionResp1
     * @instance
     */
    S2SessionResp1.prototype.deviceNonce = $util.newBuffer([]);

    /**
     * Creates a new S2SessionResp1 instance using the specified properties.
     * @function create
     * @memberof S2SessionResp1
     * @static
     * @param {IS2SessionResp1=} [properties] Properties to set
     * @returns {S2SessionResp1} S2SessionResp1 instance
     */
    S2SessionResp1.create = function create(properties) {
        return new S2SessionResp1(properties);
    };

    /**
     * Encodes the specified S2SessionResp1 message. Does not implicitly {@link S2SessionResp1.verify|verify} messages.
     * @function encode
     * @memberof S2SessionResp1
     * @static
     * @param {IS2SessionResp1} message S2SessionResp1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionResp1.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        if (message.deviceProof != null && Object.hasOwnProperty.call(message, "deviceProof"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.deviceProof);
        if (message.deviceNonce != null && Object.hasOwnProperty.call(message, "deviceNonce"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.deviceNonce);
        return writer;
    };

    /**
     * Encodes the specified S2SessionResp1 message, length delimited. Does not implicitly {@link S2SessionResp1.verify|verify} messages.
     * @function encodeDelimited
     * @memberof S2SessionResp1
     * @static
     * @param {IS2SessionResp1} message S2SessionResp1 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    S2SessionResp1.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a S2SessionResp1 message from the specified reader or buffer.
     * @function decode
     * @memberof S2SessionResp1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {S2SessionResp1} S2SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionResp1.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.S2SessionResp1();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            case 2: {
                    message.deviceProof = reader.bytes();
                    break;
                }
            case 3: {
                    message.deviceNonce = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a S2SessionResp1 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof S2SessionResp1
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {S2SessionResp1} S2SessionResp1
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    S2SessionResp1.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a S2SessionResp1 message.
     * @function verify
     * @memberof S2SessionResp1
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    S2SessionResp1.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.deviceProof != null && message.hasOwnProperty("deviceProof"))
            if (!(message.deviceProof && typeof message.deviceProof.length === "number" || $util.isString(message.deviceProof)))
                return "deviceProof: buffer expected";
        if (message.deviceNonce != null && message.hasOwnProperty("deviceNonce"))
            if (!(message.deviceNonce && typeof message.deviceNonce.length === "number" || $util.isString(message.deviceNonce)))
                return "deviceNonce: buffer expected";
        return null;
    };

    /**
     * Creates a S2SessionResp1 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof S2SessionResp1
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {S2SessionResp1} S2SessionResp1
     */
    S2SessionResp1.fromObject = function fromObject(object) {
        if (object instanceof $root.S2SessionResp1)
            return object;
        let message = new $root.S2SessionResp1();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.deviceProof != null)
            if (typeof object.deviceProof === "string")
                $util.base64.decode(object.deviceProof, message.deviceProof = $util.newBuffer($util.base64.length(object.deviceProof)), 0);
            else if (object.deviceProof.length >= 0)
                message.deviceProof = object.deviceProof;
        if (object.deviceNonce != null)
            if (typeof object.deviceNonce === "string")
                $util.base64.decode(object.deviceNonce, message.deviceNonce = $util.newBuffer($util.base64.length(object.deviceNonce)), 0);
            else if (object.deviceNonce.length >= 0)
                message.deviceNonce = object.deviceNonce;
        return message;
    };

    /**
     * Creates a plain object from a S2SessionResp1 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof S2SessionResp1
     * @static
     * @param {S2SessionResp1} message S2SessionResp1
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    S2SessionResp1.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.status = options.enums === String ? "Success" : 0;
            if (options.bytes === String)
                object.deviceProof = "";
            else {
                object.deviceProof = [];
                if (options.bytes !== Array)
                    object.deviceProof = $util.newBuffer(object.deviceProof);
            }
            if (options.bytes === String)
                object.deviceNonce = "";
            else {
                object.deviceNonce = [];
                if (options.bytes !== Array)
                    object.deviceNonce = $util.newBuffer(object.deviceNonce);
            }
        }
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.deviceProof != null && message.hasOwnProperty("deviceProof"))
            object.deviceProof = options.bytes === String ? $util.base64.encode(message.deviceProof, 0, message.deviceProof.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceProof) : message.deviceProof;
        if (message.deviceNonce != null && message.hasOwnProperty("deviceNonce"))
            object.deviceNonce = options.bytes === String ? $util.base64.encode(message.deviceNonce, 0, message.deviceNonce.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceNonce) : message.deviceNonce;
        return object;
    };

    /**
     * Converts this S2SessionResp1 to JSON.
     * @function toJSON
     * @memberof S2SessionResp1
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    S2SessionResp1.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for S2SessionResp1
     * @function getTypeUrl
     * @memberof S2SessionResp1
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    S2SessionResp1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/S2SessionResp1";
    };

    return S2SessionResp1;
})();

export const Sec2Payload = $root.Sec2Payload = (() => {

    /**
     * Properties of a Sec2Payload.
     * @exports ISec2Payload
     * @interface ISec2Payload
     * @property {Sec2MsgType|null} [msg] Sec2Payload msg
     * @property {IS2SessionCmd0|null} [sc0] Sec2Payload sc0
     * @property {IS2SessionResp0|null} [sr0] Sec2Payload sr0
     * @property {IS2SessionCmd1|null} [sc1] Sec2Payload sc1
     * @property {IS2SessionResp1|null} [sr1] Sec2Payload sr1
     */

    /**
     * Constructs a new Sec2Payload.
     * @exports Sec2Payload
     * @classdesc Represents a Sec2Payload.
     * @implements ISec2Payload
     * @constructor
     * @param {ISec2Payload=} [properties] Properties to set
     */
    function Sec2Payload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Sec2Payload msg.
     * @member {Sec2MsgType} msg
     * @memberof Sec2Payload
     * @instance
     */
    Sec2Payload.prototype.msg = 0;

    /**
     * Sec2Payload sc0.
     * @member {IS2SessionCmd0|null|undefined} sc0
     * @memberof Sec2Payload
     * @instance
     */
    Sec2Payload.prototype.sc0 = null;

    /**
     * Sec2Payload sr0.
     * @member {IS2SessionResp0|null|undefined} sr0
     * @memberof Sec2Payload
     * @instance
     */
    Sec2Payload.prototype.sr0 = null;

    /**
     * Sec2Payload sc1.
     * @member {IS2SessionCmd1|null|undefined} sc1
     * @memberof Sec2Payload
     * @instance
     */
    Sec2Payload.prototype.sc1 = null;

    /**
     * Sec2Payload sr1.
     * @member {IS2SessionResp1|null|undefined} sr1
     * @memberof Sec2Payload
     * @instance
     */
    Sec2Payload.prototype.sr1 = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Sec2Payload payload.
     * @member {"sc0"|"sr0"|"sc1"|"sr1"|undefined} payload
     * @memberof Sec2Payload
     * @instance
     */
    Object.defineProperty(Sec2Payload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["sc0", "sr0", "sc1", "sr1"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Sec2Payload instance using the specified properties.
     * @function create
     * @memberof Sec2Payload
     * @static
     * @param {ISec2Payload=} [properties] Properties to set
     * @returns {Sec2Payload} Sec2Payload instance
     */
    Sec2Payload.create = function create(properties) {
        return new Sec2Payload(properties);
    };

    /**
     * Encodes the specified Sec2Payload message. Does not implicitly {@link Sec2Payload.verify|verify} messages.
     * @function encode
     * @memberof Sec2Payload
     * @static
     * @param {ISec2Payload} message Sec2Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec2Payload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.sc0 != null && Object.hasOwnProperty.call(message, "sc0"))
            $root.S2SessionCmd0.encode(message.sc0, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
        if (message.sr0 != null && Object.hasOwnProperty.call(message, "sr0"))
            $root.S2SessionResp0.encode(message.sr0, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
        if (message.sc1 != null && Object.hasOwnProperty.call(message, "sc1"))
            $root.S2SessionCmd1.encode(message.sc1, writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
        if (message.sr1 != null && Object.hasOwnProperty.call(message, "sr1"))
            $root.S2SessionResp1.encode(message.sr1, writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Sec2Payload message, length delimited. Does not implicitly {@link Sec2Payload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Sec2Payload
     * @static
     * @param {ISec2Payload} message Sec2Payload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sec2Payload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Sec2Payload message from the specified reader or buffer.
     * @function decode
     * @memberof Sec2Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Sec2Payload} Sec2Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec2Payload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Sec2Payload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 20: {
                    message.sc0 = $root.S2SessionCmd0.decode(reader, reader.uint32());
                    break;
                }
            case 21: {
                    message.sr0 = $root.S2SessionResp0.decode(reader, reader.uint32());
                    break;
                }
            case 22: {
                    message.sc1 = $root.S2SessionCmd1.decode(reader, reader.uint32());
                    break;
                }
            case 23: {
                    message.sr1 = $root.S2SessionResp1.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Sec2Payload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Sec2Payload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Sec2Payload} Sec2Payload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sec2Payload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Sec2Payload message.
     * @function verify
     * @memberof Sec2Payload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Sec2Payload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.sc0 != null && message.hasOwnProperty("sc0")) {
            properties.payload = 1;
            {
                let error = $root.S2SessionCmd0.verify(message.sc0);
                if (error)
                    return "sc0." + error;
            }
        }
        if (message.sr0 != null && message.hasOwnProperty("sr0")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.S2SessionResp0.verify(message.sr0);
                if (error)
                    return "sr0." + error;
            }
        }
        if (message.sc1 != null && message.hasOwnProperty("sc1")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.S2SessionCmd1.verify(message.sc1);
                if (error)
                    return "sc1." + error;
            }
        }
        if (message.sr1 != null && message.hasOwnProperty("sr1")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.S2SessionResp1.verify(message.sr1);
                if (error)
                    return "sr1." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Sec2Payload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Sec2Payload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Sec2Payload} Sec2Payload
     */
    Sec2Payload.fromObject = function fromObject(object) {
        if (object instanceof $root.Sec2Payload)
            return object;
        let message = new $root.Sec2Payload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "S2Session_Command0":
        case 0:
            message.msg = 0;
            break;
        case "S2Session_Response0":
        case 1:
            message.msg = 1;
            break;
        case "S2Session_Command1":
        case 2:
            message.msg = 2;
            break;
        case "S2Session_Response1":
        case 3:
            message.msg = 3;
            break;
        }
        if (object.sc0 != null) {
            if (typeof object.sc0 !== "object")
                throw TypeError(".Sec2Payload.sc0: object expected");
            message.sc0 = $root.S2SessionCmd0.fromObject(object.sc0);
        }
        if (object.sr0 != null) {
            if (typeof object.sr0 !== "object")
                throw TypeError(".Sec2Payload.sr0: object expected");
            message.sr0 = $root.S2SessionResp0.fromObject(object.sr0);
        }
        if (object.sc1 != null) {
            if (typeof object.sc1 !== "object")
                throw TypeError(".Sec2Payload.sc1: object expected");
            message.sc1 = $root.S2SessionCmd1.fromObject(object.sc1);
        }
        if (object.sr1 != null) {
            if (typeof object.sr1 !== "object")
                throw TypeError(".Sec2Payload.sr1: object expected");
            message.sr1 = $root.S2SessionResp1.fromObject(object.sr1);
        }
        return message;
    };

    /**
     * Creates a plain object from a Sec2Payload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Sec2Payload
     * @static
     * @param {Sec2Payload} message Sec2Payload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Sec2Payload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.msg = options.enums === String ? "S2Session_Command0" : 0;
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.Sec2MsgType[message.msg] === undefined ? message.msg : $root.Sec2MsgType[message.msg] : message.msg;
        if (message.sc0 != null && message.hasOwnProperty("sc0")) {
            object.sc0 = $root.S2SessionCmd0.toObject(message.sc0, options);
            if (options.oneofs)
                object.payload = "sc0";
        }
        if (message.sr0 != null && message.hasOwnProperty("sr0")) {
            object.sr0 = $root.S2SessionResp0.toObject(message.sr0, options);
            if (options.oneofs)
                object.payload = "sr0";
        }
        if (message.sc1 != null && message.hasOwnProperty("sc1")) {
            object.sc1 = $root.S2SessionCmd1.toObject(message.sc1, options);
            if (options.oneofs)
                object.payload = "sc1";
        }
        if (message.sr1 != null && message.hasOwnProperty("sr1")) {
            object.sr1 = $root.S2SessionResp1.toObject(message.sr1, options);
            if (options.oneofs)
                object.payload = "sr1";
        }
        return object;
    };

    /**
     * Converts this Sec2Payload to JSON.
     * @function toJSON
     * @memberof Sec2Payload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Sec2Payload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Sec2Payload
     * @function getTypeUrl
     * @memberof Sec2Payload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Sec2Payload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Sec2Payload";
    };

    return Sec2Payload;
})();

/**
 * SecSchemeVersion enum.
 * @exports SecSchemeVersion
 * @enum {number}
 * @property {number} SecScheme0=0 SecScheme0 value
 * @property {number} SecScheme1=1 SecScheme1 value
 * @property {number} SecScheme2=2 SecScheme2 value
 */
export const SecSchemeVersion = $root.SecSchemeVersion = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "SecScheme0"] = 0;
    values[valuesById[1] = "SecScheme1"] = 1;
    values[valuesById[2] = "SecScheme2"] = 2;
    return values;
})();

export const SessionData = $root.SessionData = (() => {

    /**
     * Properties of a SessionData.
     * @exports ISessionData
     * @interface ISessionData
     * @property {SecSchemeVersion|null} [secVer] SessionData secVer
     * @property {ISec0Payload|null} [sec0] SessionData sec0
     * @property {ISec1Payload|null} [sec1] SessionData sec1
     * @property {ISec2Payload|null} [sec2] SessionData sec2
     */

    /**
     * Constructs a new SessionData.
     * @exports SessionData
     * @classdesc Represents a SessionData.
     * @implements ISessionData
     * @constructor
     * @param {ISessionData=} [properties] Properties to set
     */
    function SessionData(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SessionData secVer.
     * @member {SecSchemeVersion} secVer
     * @memberof SessionData
     * @instance
     */
    SessionData.prototype.secVer = 0;

    /**
     * SessionData sec0.
     * @member {ISec0Payload|null|undefined} sec0
     * @memberof SessionData
     * @instance
     */
    SessionData.prototype.sec0 = null;

    /**
     * SessionData sec1.
     * @member {ISec1Payload|null|undefined} sec1
     * @memberof SessionData
     * @instance
     */
    SessionData.prototype.sec1 = null;

    /**
     * SessionData sec2.
     * @member {ISec2Payload|null|undefined} sec2
     * @memberof SessionData
     * @instance
     */
    SessionData.prototype.sec2 = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * SessionData proto.
     * @member {"sec0"|"sec1"|"sec2"|undefined} proto
     * @memberof SessionData
     * @instance
     */
    Object.defineProperty(SessionData.prototype, "proto", {
        get: $util.oneOfGetter($oneOfFields = ["sec0", "sec1", "sec2"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new SessionData instance using the specified properties.
     * @function create
     * @memberof SessionData
     * @static
     * @param {ISessionData=} [properties] Properties to set
     * @returns {SessionData} SessionData instance
     */
    SessionData.create = function create(properties) {
        return new SessionData(properties);
    };

    /**
     * Encodes the specified SessionData message. Does not implicitly {@link SessionData.verify|verify} messages.
     * @function encode
     * @memberof SessionData
     * @static
     * @param {ISessionData} message SessionData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionData.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.secVer != null && Object.hasOwnProperty.call(message, "secVer"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.secVer);
        if (message.sec0 != null && Object.hasOwnProperty.call(message, "sec0"))
            $root.Sec0Payload.encode(message.sec0, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.sec1 != null && Object.hasOwnProperty.call(message, "sec1"))
            $root.Sec1Payload.encode(message.sec1, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.sec2 != null && Object.hasOwnProperty.call(message, "sec2"))
            $root.Sec2Payload.encode(message.sec2, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified SessionData message, length delimited. Does not implicitly {@link SessionData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SessionData
     * @static
     * @param {ISessionData} message SessionData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SessionData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SessionData message from the specified reader or buffer.
     * @function decode
     * @memberof SessionData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SessionData} SessionData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionData.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.SessionData();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 2: {
                    message.secVer = reader.int32();
                    break;
                }
            case 10: {
                    message.sec0 = $root.Sec0Payload.decode(reader, reader.uint32());
                    break;
                }
            case 11: {
                    message.sec1 = $root.Sec1Payload.decode(reader, reader.uint32());
                    break;
                }
            case 12: {
                    message.sec2 = $root.Sec2Payload.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SessionData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SessionData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SessionData} SessionData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SessionData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SessionData message.
     * @function verify
     * @memberof SessionData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SessionData.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.secVer != null && message.hasOwnProperty("secVer"))
            switch (message.secVer) {
            default:
                return "secVer: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.sec0 != null && message.hasOwnProperty("sec0")) {
            properties.proto = 1;
            {
                let error = $root.Sec0Payload.verify(message.sec0);
                if (error)
                    return "sec0." + error;
            }
        }
        if (message.sec1 != null && message.hasOwnProperty("sec1")) {
            if (properties.proto === 1)
                return "proto: multiple values";
            properties.proto = 1;
            {
                let error = $root.Sec1Payload.verify(message.sec1);
                if (error)
                    return "sec1." + error;
            }
        }
        if (message.sec2 != null && message.hasOwnProperty("sec2")) {
            if (properties.proto === 1)
                return "proto: multiple values";
            properties.proto = 1;
            {
                let error = $root.Sec2Payload.verify(message.sec2);
                if (error)
                    return "sec2." + error;
            }
        }
        return null;
    };

    /**
     * Creates a SessionData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SessionData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SessionData} SessionData
     */
    SessionData.fromObject = function fromObject(object) {
        if (object instanceof $root.SessionData)
            return object;
        let message = new $root.SessionData();
        switch (object.secVer) {
        default:
            if (typeof object.secVer === "number") {
                message.secVer = object.secVer;
                break;
            }
            break;
        case "SecScheme0":
        case 0:
            message.secVer = 0;
            break;
        case "SecScheme1":
        case 1:
            message.secVer = 1;
            break;
        case "SecScheme2":
        case 2:
            message.secVer = 2;
            break;
        }
        if (object.sec0 != null) {
            if (typeof object.sec0 !== "object")
                throw TypeError(".SessionData.sec0: object expected");
            message.sec0 = $root.Sec0Payload.fromObject(object.sec0);
        }
        if (object.sec1 != null) {
            if (typeof object.sec1 !== "object")
                throw TypeError(".SessionData.sec1: object expected");
            message.sec1 = $root.Sec1Payload.fromObject(object.sec1);
        }
        if (object.sec2 != null) {
            if (typeof object.sec2 !== "object")
                throw TypeError(".SessionData.sec2: object expected");
            message.sec2 = $root.Sec2Payload.fromObject(object.sec2);
        }
        return message;
    };

    /**
     * Creates a plain object from a SessionData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SessionData
     * @static
     * @param {SessionData} message SessionData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SessionData.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.secVer = options.enums === String ? "SecScheme0" : 0;
        if (message.secVer != null && message.hasOwnProperty("secVer"))
            object.secVer = options.enums === String ? $root.SecSchemeVersion[message.secVer] === undefined ? message.secVer : $root.SecSchemeVersion[message.secVer] : message.secVer;
        if (message.sec0 != null && message.hasOwnProperty("sec0")) {
            object.sec0 = $root.Sec0Payload.toObject(message.sec0, options);
            if (options.oneofs)
                object.proto = "sec0";
        }
        if (message.sec1 != null && message.hasOwnProperty("sec1")) {
            object.sec1 = $root.Sec1Payload.toObject(message.sec1, options);
            if (options.oneofs)
                object.proto = "sec1";
        }
        if (message.sec2 != null && message.hasOwnProperty("sec2")) {
            object.sec2 = $root.Sec2Payload.toObject(message.sec2, options);
            if (options.oneofs)
                object.proto = "sec2";
        }
        return object;
    };

    /**
     * Converts this SessionData to JSON.
     * @function toJSON
     * @memberof SessionData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SessionData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SessionData
     * @function getTypeUrl
     * @memberof SessionData
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SessionData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SessionData";
    };

    return SessionData;
})();

export const CmdGetStatus = $root.CmdGetStatus = (() => {

    /**
     * Properties of a CmdGetStatus.
     * @exports ICmdGetStatus
     * @interface ICmdGetStatus
     */

    /**
     * Constructs a new CmdGetStatus.
     * @exports CmdGetStatus
     * @classdesc Represents a CmdGetStatus.
     * @implements ICmdGetStatus
     * @constructor
     * @param {ICmdGetStatus=} [properties] Properties to set
     */
    function CmdGetStatus(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CmdGetStatus instance using the specified properties.
     * @function create
     * @memberof CmdGetStatus
     * @static
     * @param {ICmdGetStatus=} [properties] Properties to set
     * @returns {CmdGetStatus} CmdGetStatus instance
     */
    CmdGetStatus.create = function create(properties) {
        return new CmdGetStatus(properties);
    };

    /**
     * Encodes the specified CmdGetStatus message. Does not implicitly {@link CmdGetStatus.verify|verify} messages.
     * @function encode
     * @memberof CmdGetStatus
     * @static
     * @param {ICmdGetStatus} message CmdGetStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdGetStatus.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CmdGetStatus message, length delimited. Does not implicitly {@link CmdGetStatus.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdGetStatus
     * @static
     * @param {ICmdGetStatus} message CmdGetStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdGetStatus.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdGetStatus message from the specified reader or buffer.
     * @function decode
     * @memberof CmdGetStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdGetStatus} CmdGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdGetStatus.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdGetStatus();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdGetStatus message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdGetStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdGetStatus} CmdGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdGetStatus.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdGetStatus message.
     * @function verify
     * @memberof CmdGetStatus
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdGetStatus.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CmdGetStatus message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdGetStatus
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdGetStatus} CmdGetStatus
     */
    CmdGetStatus.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdGetStatus)
            return object;
        return new $root.CmdGetStatus();
    };

    /**
     * Creates a plain object from a CmdGetStatus message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdGetStatus
     * @static
     * @param {CmdGetStatus} message CmdGetStatus
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdGetStatus.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CmdGetStatus to JSON.
     * @function toJSON
     * @memberof CmdGetStatus
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdGetStatus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdGetStatus
     * @function getTypeUrl
     * @memberof CmdGetStatus
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdGetStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdGetStatus";
    };

    return CmdGetStatus;
})();

export const RespGetStatus = $root.RespGetStatus = (() => {

    /**
     * Properties of a RespGetStatus.
     * @exports IRespGetStatus
     * @interface IRespGetStatus
     * @property {Status|null} [status] RespGetStatus status
     * @property {WifiStationState|null} [staState] RespGetStatus staState
     * @property {WifiConnectFailedReason|null} [failReason] RespGetStatus failReason
     * @property {IWifiConnectedState|null} [connected] RespGetStatus connected
     */

    /**
     * Constructs a new RespGetStatus.
     * @exports RespGetStatus
     * @classdesc Represents a RespGetStatus.
     * @implements IRespGetStatus
     * @constructor
     * @param {IRespGetStatus=} [properties] Properties to set
     */
    function RespGetStatus(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RespGetStatus status.
     * @member {Status} status
     * @memberof RespGetStatus
     * @instance
     */
    RespGetStatus.prototype.status = 0;

    /**
     * RespGetStatus staState.
     * @member {WifiStationState} staState
     * @memberof RespGetStatus
     * @instance
     */
    RespGetStatus.prototype.staState = 0;

    /**
     * RespGetStatus failReason.
     * @member {WifiConnectFailedReason|null|undefined} failReason
     * @memberof RespGetStatus
     * @instance
     */
    RespGetStatus.prototype.failReason = null;

    /**
     * RespGetStatus connected.
     * @member {IWifiConnectedState|null|undefined} connected
     * @memberof RespGetStatus
     * @instance
     */
    RespGetStatus.prototype.connected = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * RespGetStatus state.
     * @member {"failReason"|"connected"|undefined} state
     * @memberof RespGetStatus
     * @instance
     */
    Object.defineProperty(RespGetStatus.prototype, "state", {
        get: $util.oneOfGetter($oneOfFields = ["failReason", "connected"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new RespGetStatus instance using the specified properties.
     * @function create
     * @memberof RespGetStatus
     * @static
     * @param {IRespGetStatus=} [properties] Properties to set
     * @returns {RespGetStatus} RespGetStatus instance
     */
    RespGetStatus.create = function create(properties) {
        return new RespGetStatus(properties);
    };

    /**
     * Encodes the specified RespGetStatus message. Does not implicitly {@link RespGetStatus.verify|verify} messages.
     * @function encode
     * @memberof RespGetStatus
     * @static
     * @param {IRespGetStatus} message RespGetStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespGetStatus.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        if (message.staState != null && Object.hasOwnProperty.call(message, "staState"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.staState);
        if (message.failReason != null && Object.hasOwnProperty.call(message, "failReason"))
            writer.uint32(/* id 10, wireType 0 =*/80).int32(message.failReason);
        if (message.connected != null && Object.hasOwnProperty.call(message, "connected"))
            $root.WifiConnectedState.encode(message.connected, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified RespGetStatus message, length delimited. Does not implicitly {@link RespGetStatus.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespGetStatus
     * @static
     * @param {IRespGetStatus} message RespGetStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespGetStatus.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespGetStatus message from the specified reader or buffer.
     * @function decode
     * @memberof RespGetStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespGetStatus} RespGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespGetStatus.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespGetStatus();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            case 2: {
                    message.staState = reader.int32();
                    break;
                }
            case 10: {
                    message.failReason = reader.int32();
                    break;
                }
            case 11: {
                    message.connected = $root.WifiConnectedState.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespGetStatus message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespGetStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespGetStatus} RespGetStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespGetStatus.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespGetStatus message.
     * @function verify
     * @memberof RespGetStatus
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespGetStatus.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.staState != null && message.hasOwnProperty("staState"))
            switch (message.staState) {
            default:
                return "staState: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.failReason != null && message.hasOwnProperty("failReason")) {
            properties.state = 1;
            switch (message.failReason) {
            default:
                return "failReason: enum value expected";
            case 0:
            case 1:
                break;
            }
        }
        if (message.connected != null && message.hasOwnProperty("connected")) {
            if (properties.state === 1)
                return "state: multiple values";
            properties.state = 1;
            {
                let error = $root.WifiConnectedState.verify(message.connected);
                if (error)
                    return "connected." + error;
            }
        }
        return null;
    };

    /**
     * Creates a RespGetStatus message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespGetStatus
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespGetStatus} RespGetStatus
     */
    RespGetStatus.fromObject = function fromObject(object) {
        if (object instanceof $root.RespGetStatus)
            return object;
        let message = new $root.RespGetStatus();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        switch (object.staState) {
        default:
            if (typeof object.staState === "number") {
                message.staState = object.staState;
                break;
            }
            break;
        case "Connected":
        case 0:
            message.staState = 0;
            break;
        case "Connecting":
        case 1:
            message.staState = 1;
            break;
        case "Disconnected":
        case 2:
            message.staState = 2;
            break;
        case "ConnectionFailed":
        case 3:
            message.staState = 3;
            break;
        }
        switch (object.failReason) {
        default:
            if (typeof object.failReason === "number") {
                message.failReason = object.failReason;
                break;
            }
            break;
        case "AuthError":
        case 0:
            message.failReason = 0;
            break;
        case "NetworkNotFound":
        case 1:
            message.failReason = 1;
            break;
        }
        if (object.connected != null) {
            if (typeof object.connected !== "object")
                throw TypeError(".RespGetStatus.connected: object expected");
            message.connected = $root.WifiConnectedState.fromObject(object.connected);
        }
        return message;
    };

    /**
     * Creates a plain object from a RespGetStatus message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespGetStatus
     * @static
     * @param {RespGetStatus} message RespGetStatus
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespGetStatus.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.status = options.enums === String ? "Success" : 0;
            object.staState = options.enums === String ? "Connected" : 0;
        }
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.staState != null && message.hasOwnProperty("staState"))
            object.staState = options.enums === String ? $root.WifiStationState[message.staState] === undefined ? message.staState : $root.WifiStationState[message.staState] : message.staState;
        if (message.failReason != null && message.hasOwnProperty("failReason")) {
            object.failReason = options.enums === String ? $root.WifiConnectFailedReason[message.failReason] === undefined ? message.failReason : $root.WifiConnectFailedReason[message.failReason] : message.failReason;
            if (options.oneofs)
                object.state = "failReason";
        }
        if (message.connected != null && message.hasOwnProperty("connected")) {
            object.connected = $root.WifiConnectedState.toObject(message.connected, options);
            if (options.oneofs)
                object.state = "connected";
        }
        return object;
    };

    /**
     * Converts this RespGetStatus to JSON.
     * @function toJSON
     * @memberof RespGetStatus
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespGetStatus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespGetStatus
     * @function getTypeUrl
     * @memberof RespGetStatus
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespGetStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespGetStatus";
    };

    return RespGetStatus;
})();

export const CmdSetConfig = $root.CmdSetConfig = (() => {

    /**
     * Properties of a CmdSetConfig.
     * @exports ICmdSetConfig
     * @interface ICmdSetConfig
     * @property {Uint8Array|null} [ssid] CmdSetConfig ssid
     * @property {Uint8Array|null} [passphrase] CmdSetConfig passphrase
     * @property {Uint8Array|null} [bssid] CmdSetConfig bssid
     * @property {number|null} [channel] CmdSetConfig channel
     */

    /**
     * Constructs a new CmdSetConfig.
     * @exports CmdSetConfig
     * @classdesc Represents a CmdSetConfig.
     * @implements ICmdSetConfig
     * @constructor
     * @param {ICmdSetConfig=} [properties] Properties to set
     */
    function CmdSetConfig(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CmdSetConfig ssid.
     * @member {Uint8Array} ssid
     * @memberof CmdSetConfig
     * @instance
     */
    CmdSetConfig.prototype.ssid = $util.newBuffer([]);

    /**
     * CmdSetConfig passphrase.
     * @member {Uint8Array} passphrase
     * @memberof CmdSetConfig
     * @instance
     */
    CmdSetConfig.prototype.passphrase = $util.newBuffer([]);

    /**
     * CmdSetConfig bssid.
     * @member {Uint8Array} bssid
     * @memberof CmdSetConfig
     * @instance
     */
    CmdSetConfig.prototype.bssid = $util.newBuffer([]);

    /**
     * CmdSetConfig channel.
     * @member {number} channel
     * @memberof CmdSetConfig
     * @instance
     */
    CmdSetConfig.prototype.channel = 0;

    /**
     * Creates a new CmdSetConfig instance using the specified properties.
     * @function create
     * @memberof CmdSetConfig
     * @static
     * @param {ICmdSetConfig=} [properties] Properties to set
     * @returns {CmdSetConfig} CmdSetConfig instance
     */
    CmdSetConfig.create = function create(properties) {
        return new CmdSetConfig(properties);
    };

    /**
     * Encodes the specified CmdSetConfig message. Does not implicitly {@link CmdSetConfig.verify|verify} messages.
     * @function encode
     * @memberof CmdSetConfig
     * @static
     * @param {ICmdSetConfig} message CmdSetConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdSetConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.ssid != null && Object.hasOwnProperty.call(message, "ssid"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ssid);
        if (message.passphrase != null && Object.hasOwnProperty.call(message, "passphrase"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.passphrase);
        if (message.bssid != null && Object.hasOwnProperty.call(message, "bssid"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.bssid);
        if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.channel);
        return writer;
    };

    /**
     * Encodes the specified CmdSetConfig message, length delimited. Does not implicitly {@link CmdSetConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdSetConfig
     * @static
     * @param {ICmdSetConfig} message CmdSetConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdSetConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdSetConfig message from the specified reader or buffer.
     * @function decode
     * @memberof CmdSetConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdSetConfig} CmdSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdSetConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdSetConfig();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.ssid = reader.bytes();
                    break;
                }
            case 2: {
                    message.passphrase = reader.bytes();
                    break;
                }
            case 3: {
                    message.bssid = reader.bytes();
                    break;
                }
            case 4: {
                    message.channel = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdSetConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdSetConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdSetConfig} CmdSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdSetConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdSetConfig message.
     * @function verify
     * @memberof CmdSetConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdSetConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            if (!(message.ssid && typeof message.ssid.length === "number" || $util.isString(message.ssid)))
                return "ssid: buffer expected";
        if (message.passphrase != null && message.hasOwnProperty("passphrase"))
            if (!(message.passphrase && typeof message.passphrase.length === "number" || $util.isString(message.passphrase)))
                return "passphrase: buffer expected";
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            if (!(message.bssid && typeof message.bssid.length === "number" || $util.isString(message.bssid)))
                return "bssid: buffer expected";
        if (message.channel != null && message.hasOwnProperty("channel"))
            if (!$util.isInteger(message.channel))
                return "channel: integer expected";
        return null;
    };

    /**
     * Creates a CmdSetConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdSetConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdSetConfig} CmdSetConfig
     */
    CmdSetConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdSetConfig)
            return object;
        let message = new $root.CmdSetConfig();
        if (object.ssid != null)
            if (typeof object.ssid === "string")
                $util.base64.decode(object.ssid, message.ssid = $util.newBuffer($util.base64.length(object.ssid)), 0);
            else if (object.ssid.length >= 0)
                message.ssid = object.ssid;
        if (object.passphrase != null)
            if (typeof object.passphrase === "string")
                $util.base64.decode(object.passphrase, message.passphrase = $util.newBuffer($util.base64.length(object.passphrase)), 0);
            else if (object.passphrase.length >= 0)
                message.passphrase = object.passphrase;
        if (object.bssid != null)
            if (typeof object.bssid === "string")
                $util.base64.decode(object.bssid, message.bssid = $util.newBuffer($util.base64.length(object.bssid)), 0);
            else if (object.bssid.length >= 0)
                message.bssid = object.bssid;
        if (object.channel != null)
            message.channel = object.channel | 0;
        return message;
    };

    /**
     * Creates a plain object from a CmdSetConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdSetConfig
     * @static
     * @param {CmdSetConfig} message CmdSetConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdSetConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.ssid = "";
            else {
                object.ssid = [];
                if (options.bytes !== Array)
                    object.ssid = $util.newBuffer(object.ssid);
            }
            if (options.bytes === String)
                object.passphrase = "";
            else {
                object.passphrase = [];
                if (options.bytes !== Array)
                    object.passphrase = $util.newBuffer(object.passphrase);
            }
            if (options.bytes === String)
                object.bssid = "";
            else {
                object.bssid = [];
                if (options.bytes !== Array)
                    object.bssid = $util.newBuffer(object.bssid);
            }
            object.channel = 0;
        }
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            object.ssid = options.bytes === String ? $util.base64.encode(message.ssid, 0, message.ssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.ssid) : message.ssid;
        if (message.passphrase != null && message.hasOwnProperty("passphrase"))
            object.passphrase = options.bytes === String ? $util.base64.encode(message.passphrase, 0, message.passphrase.length) : options.bytes === Array ? Array.prototype.slice.call(message.passphrase) : message.passphrase;
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            object.bssid = options.bytes === String ? $util.base64.encode(message.bssid, 0, message.bssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.bssid) : message.bssid;
        if (message.channel != null && message.hasOwnProperty("channel"))
            object.channel = message.channel;
        return object;
    };

    /**
     * Converts this CmdSetConfig to JSON.
     * @function toJSON
     * @memberof CmdSetConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdSetConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdSetConfig
     * @function getTypeUrl
     * @memberof CmdSetConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdSetConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdSetConfig";
    };

    return CmdSetConfig;
})();

export const RespSetConfig = $root.RespSetConfig = (() => {

    /**
     * Properties of a RespSetConfig.
     * @exports IRespSetConfig
     * @interface IRespSetConfig
     * @property {Status|null} [status] RespSetConfig status
     */

    /**
     * Constructs a new RespSetConfig.
     * @exports RespSetConfig
     * @classdesc Represents a RespSetConfig.
     * @implements IRespSetConfig
     * @constructor
     * @param {IRespSetConfig=} [properties] Properties to set
     */
    function RespSetConfig(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RespSetConfig status.
     * @member {Status} status
     * @memberof RespSetConfig
     * @instance
     */
    RespSetConfig.prototype.status = 0;

    /**
     * Creates a new RespSetConfig instance using the specified properties.
     * @function create
     * @memberof RespSetConfig
     * @static
     * @param {IRespSetConfig=} [properties] Properties to set
     * @returns {RespSetConfig} RespSetConfig instance
     */
    RespSetConfig.create = function create(properties) {
        return new RespSetConfig(properties);
    };

    /**
     * Encodes the specified RespSetConfig message. Does not implicitly {@link RespSetConfig.verify|verify} messages.
     * @function encode
     * @memberof RespSetConfig
     * @static
     * @param {IRespSetConfig} message RespSetConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespSetConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        return writer;
    };

    /**
     * Encodes the specified RespSetConfig message, length delimited. Does not implicitly {@link RespSetConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespSetConfig
     * @static
     * @param {IRespSetConfig} message RespSetConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespSetConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespSetConfig message from the specified reader or buffer.
     * @function decode
     * @memberof RespSetConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespSetConfig} RespSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespSetConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespSetConfig();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespSetConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespSetConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespSetConfig} RespSetConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespSetConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespSetConfig message.
     * @function verify
     * @memberof RespSetConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespSetConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        return null;
    };

    /**
     * Creates a RespSetConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespSetConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespSetConfig} RespSetConfig
     */
    RespSetConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.RespSetConfig)
            return object;
        let message = new $root.RespSetConfig();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a RespSetConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespSetConfig
     * @static
     * @param {RespSetConfig} message RespSetConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespSetConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.status = options.enums === String ? "Success" : 0;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        return object;
    };

    /**
     * Converts this RespSetConfig to JSON.
     * @function toJSON
     * @memberof RespSetConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespSetConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespSetConfig
     * @function getTypeUrl
     * @memberof RespSetConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespSetConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespSetConfig";
    };

    return RespSetConfig;
})();

export const CmdApplyConfig = $root.CmdApplyConfig = (() => {

    /**
     * Properties of a CmdApplyConfig.
     * @exports ICmdApplyConfig
     * @interface ICmdApplyConfig
     */

    /**
     * Constructs a new CmdApplyConfig.
     * @exports CmdApplyConfig
     * @classdesc Represents a CmdApplyConfig.
     * @implements ICmdApplyConfig
     * @constructor
     * @param {ICmdApplyConfig=} [properties] Properties to set
     */
    function CmdApplyConfig(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CmdApplyConfig instance using the specified properties.
     * @function create
     * @memberof CmdApplyConfig
     * @static
     * @param {ICmdApplyConfig=} [properties] Properties to set
     * @returns {CmdApplyConfig} CmdApplyConfig instance
     */
    CmdApplyConfig.create = function create(properties) {
        return new CmdApplyConfig(properties);
    };

    /**
     * Encodes the specified CmdApplyConfig message. Does not implicitly {@link CmdApplyConfig.verify|verify} messages.
     * @function encode
     * @memberof CmdApplyConfig
     * @static
     * @param {ICmdApplyConfig} message CmdApplyConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdApplyConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CmdApplyConfig message, length delimited. Does not implicitly {@link CmdApplyConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdApplyConfig
     * @static
     * @param {ICmdApplyConfig} message CmdApplyConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdApplyConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdApplyConfig message from the specified reader or buffer.
     * @function decode
     * @memberof CmdApplyConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdApplyConfig} CmdApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdApplyConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdApplyConfig();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdApplyConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdApplyConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdApplyConfig} CmdApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdApplyConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdApplyConfig message.
     * @function verify
     * @memberof CmdApplyConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdApplyConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CmdApplyConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdApplyConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdApplyConfig} CmdApplyConfig
     */
    CmdApplyConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdApplyConfig)
            return object;
        return new $root.CmdApplyConfig();
    };

    /**
     * Creates a plain object from a CmdApplyConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdApplyConfig
     * @static
     * @param {CmdApplyConfig} message CmdApplyConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdApplyConfig.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CmdApplyConfig to JSON.
     * @function toJSON
     * @memberof CmdApplyConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdApplyConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdApplyConfig
     * @function getTypeUrl
     * @memberof CmdApplyConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdApplyConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdApplyConfig";
    };

    return CmdApplyConfig;
})();

export const RespApplyConfig = $root.RespApplyConfig = (() => {

    /**
     * Properties of a RespApplyConfig.
     * @exports IRespApplyConfig
     * @interface IRespApplyConfig
     * @property {Status|null} [status] RespApplyConfig status
     */

    /**
     * Constructs a new RespApplyConfig.
     * @exports RespApplyConfig
     * @classdesc Represents a RespApplyConfig.
     * @implements IRespApplyConfig
     * @constructor
     * @param {IRespApplyConfig=} [properties] Properties to set
     */
    function RespApplyConfig(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RespApplyConfig status.
     * @member {Status} status
     * @memberof RespApplyConfig
     * @instance
     */
    RespApplyConfig.prototype.status = 0;

    /**
     * Creates a new RespApplyConfig instance using the specified properties.
     * @function create
     * @memberof RespApplyConfig
     * @static
     * @param {IRespApplyConfig=} [properties] Properties to set
     * @returns {RespApplyConfig} RespApplyConfig instance
     */
    RespApplyConfig.create = function create(properties) {
        return new RespApplyConfig(properties);
    };

    /**
     * Encodes the specified RespApplyConfig message. Does not implicitly {@link RespApplyConfig.verify|verify} messages.
     * @function encode
     * @memberof RespApplyConfig
     * @static
     * @param {IRespApplyConfig} message RespApplyConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespApplyConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
        return writer;
    };

    /**
     * Encodes the specified RespApplyConfig message, length delimited. Does not implicitly {@link RespApplyConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespApplyConfig
     * @static
     * @param {IRespApplyConfig} message RespApplyConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespApplyConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespApplyConfig message from the specified reader or buffer.
     * @function decode
     * @memberof RespApplyConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespApplyConfig} RespApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespApplyConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespApplyConfig();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.status = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespApplyConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespApplyConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespApplyConfig} RespApplyConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespApplyConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespApplyConfig message.
     * @function verify
     * @memberof RespApplyConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespApplyConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        return null;
    };

    /**
     * Creates a RespApplyConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespApplyConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespApplyConfig} RespApplyConfig
     */
    RespApplyConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.RespApplyConfig)
            return object;
        let message = new $root.RespApplyConfig();
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a RespApplyConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespApplyConfig
     * @static
     * @param {RespApplyConfig} message RespApplyConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespApplyConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.status = options.enums === String ? "Success" : 0;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        return object;
    };

    /**
     * Converts this RespApplyConfig to JSON.
     * @function toJSON
     * @memberof RespApplyConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespApplyConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespApplyConfig
     * @function getTypeUrl
     * @memberof RespApplyConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespApplyConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespApplyConfig";
    };

    return RespApplyConfig;
})();

/**
 * WiFiConfigMsgType enum.
 * @exports WiFiConfigMsgType
 * @enum {number}
 * @property {number} TypeCmdGetStatus=0 TypeCmdGetStatus value
 * @property {number} TypeRespGetStatus=1 TypeRespGetStatus value
 * @property {number} TypeCmdSetConfig=2 TypeCmdSetConfig value
 * @property {number} TypeRespSetConfig=3 TypeRespSetConfig value
 * @property {number} TypeCmdApplyConfig=4 TypeCmdApplyConfig value
 * @property {number} TypeRespApplyConfig=5 TypeRespApplyConfig value
 */
export const WiFiConfigMsgType = $root.WiFiConfigMsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "TypeCmdGetStatus"] = 0;
    values[valuesById[1] = "TypeRespGetStatus"] = 1;
    values[valuesById[2] = "TypeCmdSetConfig"] = 2;
    values[valuesById[3] = "TypeRespSetConfig"] = 3;
    values[valuesById[4] = "TypeCmdApplyConfig"] = 4;
    values[valuesById[5] = "TypeRespApplyConfig"] = 5;
    return values;
})();

export const WiFiConfigPayload = $root.WiFiConfigPayload = (() => {

    /**
     * Properties of a WiFiConfigPayload.
     * @exports IWiFiConfigPayload
     * @interface IWiFiConfigPayload
     * @property {WiFiConfigMsgType|null} [msg] WiFiConfigPayload msg
     * @property {ICmdGetStatus|null} [cmdGetStatus] WiFiConfigPayload cmdGetStatus
     * @property {IRespGetStatus|null} [respGetStatus] WiFiConfigPayload respGetStatus
     * @property {ICmdSetConfig|null} [cmdSetConfig] WiFiConfigPayload cmdSetConfig
     * @property {IRespSetConfig|null} [respSetConfig] WiFiConfigPayload respSetConfig
     * @property {ICmdApplyConfig|null} [cmdApplyConfig] WiFiConfigPayload cmdApplyConfig
     * @property {IRespApplyConfig|null} [respApplyConfig] WiFiConfigPayload respApplyConfig
     */

    /**
     * Constructs a new WiFiConfigPayload.
     * @exports WiFiConfigPayload
     * @classdesc Represents a WiFiConfigPayload.
     * @implements IWiFiConfigPayload
     * @constructor
     * @param {IWiFiConfigPayload=} [properties] Properties to set
     */
    function WiFiConfigPayload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WiFiConfigPayload msg.
     * @member {WiFiConfigMsgType} msg
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.msg = 0;

    /**
     * WiFiConfigPayload cmdGetStatus.
     * @member {ICmdGetStatus|null|undefined} cmdGetStatus
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.cmdGetStatus = null;

    /**
     * WiFiConfigPayload respGetStatus.
     * @member {IRespGetStatus|null|undefined} respGetStatus
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.respGetStatus = null;

    /**
     * WiFiConfigPayload cmdSetConfig.
     * @member {ICmdSetConfig|null|undefined} cmdSetConfig
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.cmdSetConfig = null;

    /**
     * WiFiConfigPayload respSetConfig.
     * @member {IRespSetConfig|null|undefined} respSetConfig
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.respSetConfig = null;

    /**
     * WiFiConfigPayload cmdApplyConfig.
     * @member {ICmdApplyConfig|null|undefined} cmdApplyConfig
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.cmdApplyConfig = null;

    /**
     * WiFiConfigPayload respApplyConfig.
     * @member {IRespApplyConfig|null|undefined} respApplyConfig
     * @memberof WiFiConfigPayload
     * @instance
     */
    WiFiConfigPayload.prototype.respApplyConfig = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * WiFiConfigPayload payload.
     * @member {"cmdGetStatus"|"respGetStatus"|"cmdSetConfig"|"respSetConfig"|"cmdApplyConfig"|"respApplyConfig"|undefined} payload
     * @memberof WiFiConfigPayload
     * @instance
     */
    Object.defineProperty(WiFiConfigPayload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["cmdGetStatus", "respGetStatus", "cmdSetConfig", "respSetConfig", "cmdApplyConfig", "respApplyConfig"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new WiFiConfigPayload instance using the specified properties.
     * @function create
     * @memberof WiFiConfigPayload
     * @static
     * @param {IWiFiConfigPayload=} [properties] Properties to set
     * @returns {WiFiConfigPayload} WiFiConfigPayload instance
     */
    WiFiConfigPayload.create = function create(properties) {
        return new WiFiConfigPayload(properties);
    };

    /**
     * Encodes the specified WiFiConfigPayload message. Does not implicitly {@link WiFiConfigPayload.verify|verify} messages.
     * @function encode
     * @memberof WiFiConfigPayload
     * @static
     * @param {IWiFiConfigPayload} message WiFiConfigPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiConfigPayload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.cmdGetStatus != null && Object.hasOwnProperty.call(message, "cmdGetStatus"))
            $root.CmdGetStatus.encode(message.cmdGetStatus, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.respGetStatus != null && Object.hasOwnProperty.call(message, "respGetStatus"))
            $root.RespGetStatus.encode(message.respGetStatus, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.cmdSetConfig != null && Object.hasOwnProperty.call(message, "cmdSetConfig"))
            $root.CmdSetConfig.encode(message.cmdSetConfig, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        if (message.respSetConfig != null && Object.hasOwnProperty.call(message, "respSetConfig"))
            $root.RespSetConfig.encode(message.respSetConfig, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
        if (message.cmdApplyConfig != null && Object.hasOwnProperty.call(message, "cmdApplyConfig"))
            $root.CmdApplyConfig.encode(message.cmdApplyConfig, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        if (message.respApplyConfig != null && Object.hasOwnProperty.call(message, "respApplyConfig"))
            $root.RespApplyConfig.encode(message.respApplyConfig, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified WiFiConfigPayload message, length delimited. Does not implicitly {@link WiFiConfigPayload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WiFiConfigPayload
     * @static
     * @param {IWiFiConfigPayload} message WiFiConfigPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiConfigPayload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WiFiConfigPayload message from the specified reader or buffer.
     * @function decode
     * @memberof WiFiConfigPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WiFiConfigPayload} WiFiConfigPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiConfigPayload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WiFiConfigPayload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 10: {
                    message.cmdGetStatus = $root.CmdGetStatus.decode(reader, reader.uint32());
                    break;
                }
            case 11: {
                    message.respGetStatus = $root.RespGetStatus.decode(reader, reader.uint32());
                    break;
                }
            case 12: {
                    message.cmdSetConfig = $root.CmdSetConfig.decode(reader, reader.uint32());
                    break;
                }
            case 13: {
                    message.respSetConfig = $root.RespSetConfig.decode(reader, reader.uint32());
                    break;
                }
            case 14: {
                    message.cmdApplyConfig = $root.CmdApplyConfig.decode(reader, reader.uint32());
                    break;
                }
            case 15: {
                    message.respApplyConfig = $root.RespApplyConfig.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a WiFiConfigPayload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WiFiConfigPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WiFiConfigPayload} WiFiConfigPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiConfigPayload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WiFiConfigPayload message.
     * @function verify
     * @memberof WiFiConfigPayload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WiFiConfigPayload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
        if (message.cmdGetStatus != null && message.hasOwnProperty("cmdGetStatus")) {
            properties.payload = 1;
            {
                let error = $root.CmdGetStatus.verify(message.cmdGetStatus);
                if (error)
                    return "cmdGetStatus." + error;
            }
        }
        if (message.respGetStatus != null && message.hasOwnProperty("respGetStatus")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespGetStatus.verify(message.respGetStatus);
                if (error)
                    return "respGetStatus." + error;
            }
        }
        if (message.cmdSetConfig != null && message.hasOwnProperty("cmdSetConfig")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.CmdSetConfig.verify(message.cmdSetConfig);
                if (error)
                    return "cmdSetConfig." + error;
            }
        }
        if (message.respSetConfig != null && message.hasOwnProperty("respSetConfig")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespSetConfig.verify(message.respSetConfig);
                if (error)
                    return "respSetConfig." + error;
            }
        }
        if (message.cmdApplyConfig != null && message.hasOwnProperty("cmdApplyConfig")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.CmdApplyConfig.verify(message.cmdApplyConfig);
                if (error)
                    return "cmdApplyConfig." + error;
            }
        }
        if (message.respApplyConfig != null && message.hasOwnProperty("respApplyConfig")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespApplyConfig.verify(message.respApplyConfig);
                if (error)
                    return "respApplyConfig." + error;
            }
        }
        return null;
    };

    /**
     * Creates a WiFiConfigPayload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WiFiConfigPayload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WiFiConfigPayload} WiFiConfigPayload
     */
    WiFiConfigPayload.fromObject = function fromObject(object) {
        if (object instanceof $root.WiFiConfigPayload)
            return object;
        let message = new $root.WiFiConfigPayload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "TypeCmdGetStatus":
        case 0:
            message.msg = 0;
            break;
        case "TypeRespGetStatus":
        case 1:
            message.msg = 1;
            break;
        case "TypeCmdSetConfig":
        case 2:
            message.msg = 2;
            break;
        case "TypeRespSetConfig":
        case 3:
            message.msg = 3;
            break;
        case "TypeCmdApplyConfig":
        case 4:
            message.msg = 4;
            break;
        case "TypeRespApplyConfig":
        case 5:
            message.msg = 5;
            break;
        }
        if (object.cmdGetStatus != null) {
            if (typeof object.cmdGetStatus !== "object")
                throw TypeError(".WiFiConfigPayload.cmdGetStatus: object expected");
            message.cmdGetStatus = $root.CmdGetStatus.fromObject(object.cmdGetStatus);
        }
        if (object.respGetStatus != null) {
            if (typeof object.respGetStatus !== "object")
                throw TypeError(".WiFiConfigPayload.respGetStatus: object expected");
            message.respGetStatus = $root.RespGetStatus.fromObject(object.respGetStatus);
        }
        if (object.cmdSetConfig != null) {
            if (typeof object.cmdSetConfig !== "object")
                throw TypeError(".WiFiConfigPayload.cmdSetConfig: object expected");
            message.cmdSetConfig = $root.CmdSetConfig.fromObject(object.cmdSetConfig);
        }
        if (object.respSetConfig != null) {
            if (typeof object.respSetConfig !== "object")
                throw TypeError(".WiFiConfigPayload.respSetConfig: object expected");
            message.respSetConfig = $root.RespSetConfig.fromObject(object.respSetConfig);
        }
        if (object.cmdApplyConfig != null) {
            if (typeof object.cmdApplyConfig !== "object")
                throw TypeError(".WiFiConfigPayload.cmdApplyConfig: object expected");
            message.cmdApplyConfig = $root.CmdApplyConfig.fromObject(object.cmdApplyConfig);
        }
        if (object.respApplyConfig != null) {
            if (typeof object.respApplyConfig !== "object")
                throw TypeError(".WiFiConfigPayload.respApplyConfig: object expected");
            message.respApplyConfig = $root.RespApplyConfig.fromObject(object.respApplyConfig);
        }
        return message;
    };

    /**
     * Creates a plain object from a WiFiConfigPayload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WiFiConfigPayload
     * @static
     * @param {WiFiConfigPayload} message WiFiConfigPayload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WiFiConfigPayload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.msg = options.enums === String ? "TypeCmdGetStatus" : 0;
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.WiFiConfigMsgType[message.msg] === undefined ? message.msg : $root.WiFiConfigMsgType[message.msg] : message.msg;
        if (message.cmdGetStatus != null && message.hasOwnProperty("cmdGetStatus")) {
            object.cmdGetStatus = $root.CmdGetStatus.toObject(message.cmdGetStatus, options);
            if (options.oneofs)
                object.payload = "cmdGetStatus";
        }
        if (message.respGetStatus != null && message.hasOwnProperty("respGetStatus")) {
            object.respGetStatus = $root.RespGetStatus.toObject(message.respGetStatus, options);
            if (options.oneofs)
                object.payload = "respGetStatus";
        }
        if (message.cmdSetConfig != null && message.hasOwnProperty("cmdSetConfig")) {
            object.cmdSetConfig = $root.CmdSetConfig.toObject(message.cmdSetConfig, options);
            if (options.oneofs)
                object.payload = "cmdSetConfig";
        }
        if (message.respSetConfig != null && message.hasOwnProperty("respSetConfig")) {
            object.respSetConfig = $root.RespSetConfig.toObject(message.respSetConfig, options);
            if (options.oneofs)
                object.payload = "respSetConfig";
        }
        if (message.cmdApplyConfig != null && message.hasOwnProperty("cmdApplyConfig")) {
            object.cmdApplyConfig = $root.CmdApplyConfig.toObject(message.cmdApplyConfig, options);
            if (options.oneofs)
                object.payload = "cmdApplyConfig";
        }
        if (message.respApplyConfig != null && message.hasOwnProperty("respApplyConfig")) {
            object.respApplyConfig = $root.RespApplyConfig.toObject(message.respApplyConfig, options);
            if (options.oneofs)
                object.payload = "respApplyConfig";
        }
        return object;
    };

    /**
     * Converts this WiFiConfigPayload to JSON.
     * @function toJSON
     * @memberof WiFiConfigPayload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WiFiConfigPayload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WiFiConfigPayload
     * @function getTypeUrl
     * @memberof WiFiConfigPayload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WiFiConfigPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WiFiConfigPayload";
    };

    return WiFiConfigPayload;
})();

/**
 * WifiStationState enum.
 * @exports WifiStationState
 * @enum {number}
 * @property {number} Connected=0 Connected value
 * @property {number} Connecting=1 Connecting value
 * @property {number} Disconnected=2 Disconnected value
 * @property {number} ConnectionFailed=3 ConnectionFailed value
 */
export const WifiStationState = $root.WifiStationState = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Connected"] = 0;
    values[valuesById[1] = "Connecting"] = 1;
    values[valuesById[2] = "Disconnected"] = 2;
    values[valuesById[3] = "ConnectionFailed"] = 3;
    return values;
})();

/**
 * WifiConnectFailedReason enum.
 * @exports WifiConnectFailedReason
 * @enum {number}
 * @property {number} AuthError=0 AuthError value
 * @property {number} NetworkNotFound=1 NetworkNotFound value
 */
export const WifiConnectFailedReason = $root.WifiConnectFailedReason = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "AuthError"] = 0;
    values[valuesById[1] = "NetworkNotFound"] = 1;
    return values;
})();

/**
 * WifiAuthMode enum.
 * @exports WifiAuthMode
 * @enum {number}
 * @property {number} Open=0 Open value
 * @property {number} WEP=1 WEP value
 * @property {number} WPA_PSK=2 WPA_PSK value
 * @property {number} WPA2_PSK=3 WPA2_PSK value
 * @property {number} WPA_WPA2_PSK=4 WPA_WPA2_PSK value
 * @property {number} WPA2_ENTERPRISE=5 WPA2_ENTERPRISE value
 * @property {number} WPA3_PSK=6 WPA3_PSK value
 * @property {number} WPA2_WPA3_PSK=7 WPA2_WPA3_PSK value
 */
export const WifiAuthMode = $root.WifiAuthMode = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Open"] = 0;
    values[valuesById[1] = "WEP"] = 1;
    values[valuesById[2] = "WPA_PSK"] = 2;
    values[valuesById[3] = "WPA2_PSK"] = 3;
    values[valuesById[4] = "WPA_WPA2_PSK"] = 4;
    values[valuesById[5] = "WPA2_ENTERPRISE"] = 5;
    values[valuesById[6] = "WPA3_PSK"] = 6;
    values[valuesById[7] = "WPA2_WPA3_PSK"] = 7;
    return values;
})();

export const WifiConnectedState = $root.WifiConnectedState = (() => {

    /**
     * Properties of a WifiConnectedState.
     * @exports IWifiConnectedState
     * @interface IWifiConnectedState
     * @property {string|null} [ip4Addr] WifiConnectedState ip4Addr
     * @property {WifiAuthMode|null} [authMode] WifiConnectedState authMode
     * @property {Uint8Array|null} [ssid] WifiConnectedState ssid
     * @property {Uint8Array|null} [bssid] WifiConnectedState bssid
     * @property {number|null} [channel] WifiConnectedState channel
     */

    /**
     * Constructs a new WifiConnectedState.
     * @exports WifiConnectedState
     * @classdesc Represents a WifiConnectedState.
     * @implements IWifiConnectedState
     * @constructor
     * @param {IWifiConnectedState=} [properties] Properties to set
     */
    function WifiConnectedState(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WifiConnectedState ip4Addr.
     * @member {string} ip4Addr
     * @memberof WifiConnectedState
     * @instance
     */
    WifiConnectedState.prototype.ip4Addr = "";

    /**
     * WifiConnectedState authMode.
     * @member {WifiAuthMode} authMode
     * @memberof WifiConnectedState
     * @instance
     */
    WifiConnectedState.prototype.authMode = 0;

    /**
     * WifiConnectedState ssid.
     * @member {Uint8Array} ssid
     * @memberof WifiConnectedState
     * @instance
     */
    WifiConnectedState.prototype.ssid = $util.newBuffer([]);

    /**
     * WifiConnectedState bssid.
     * @member {Uint8Array} bssid
     * @memberof WifiConnectedState
     * @instance
     */
    WifiConnectedState.prototype.bssid = $util.newBuffer([]);

    /**
     * WifiConnectedState channel.
     * @member {number} channel
     * @memberof WifiConnectedState
     * @instance
     */
    WifiConnectedState.prototype.channel = 0;

    /**
     * Creates a new WifiConnectedState instance using the specified properties.
     * @function create
     * @memberof WifiConnectedState
     * @static
     * @param {IWifiConnectedState=} [properties] Properties to set
     * @returns {WifiConnectedState} WifiConnectedState instance
     */
    WifiConnectedState.create = function create(properties) {
        return new WifiConnectedState(properties);
    };

    /**
     * Encodes the specified WifiConnectedState message. Does not implicitly {@link WifiConnectedState.verify|verify} messages.
     * @function encode
     * @memberof WifiConnectedState
     * @static
     * @param {IWifiConnectedState} message WifiConnectedState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WifiConnectedState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.ip4Addr != null && Object.hasOwnProperty.call(message, "ip4Addr"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.ip4Addr);
        if (message.authMode != null && Object.hasOwnProperty.call(message, "authMode"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.authMode);
        if (message.ssid != null && Object.hasOwnProperty.call(message, "ssid"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.ssid);
        if (message.bssid != null && Object.hasOwnProperty.call(message, "bssid"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.bssid);
        if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.channel);
        return writer;
    };

    /**
     * Encodes the specified WifiConnectedState message, length delimited. Does not implicitly {@link WifiConnectedState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WifiConnectedState
     * @static
     * @param {IWifiConnectedState} message WifiConnectedState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WifiConnectedState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WifiConnectedState message from the specified reader or buffer.
     * @function decode
     * @memberof WifiConnectedState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WifiConnectedState} WifiConnectedState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WifiConnectedState.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WifiConnectedState();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.ip4Addr = reader.string();
                    break;
                }
            case 2: {
                    message.authMode = reader.int32();
                    break;
                }
            case 3: {
                    message.ssid = reader.bytes();
                    break;
                }
            case 4: {
                    message.bssid = reader.bytes();
                    break;
                }
            case 5: {
                    message.channel = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a WifiConnectedState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WifiConnectedState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WifiConnectedState} WifiConnectedState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WifiConnectedState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WifiConnectedState message.
     * @function verify
     * @memberof WifiConnectedState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WifiConnectedState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.ip4Addr != null && message.hasOwnProperty("ip4Addr"))
            if (!$util.isString(message.ip4Addr))
                return "ip4Addr: string expected";
        if (message.authMode != null && message.hasOwnProperty("authMode"))
            switch (message.authMode) {
            default:
                return "authMode: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            if (!(message.ssid && typeof message.ssid.length === "number" || $util.isString(message.ssid)))
                return "ssid: buffer expected";
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            if (!(message.bssid && typeof message.bssid.length === "number" || $util.isString(message.bssid)))
                return "bssid: buffer expected";
        if (message.channel != null && message.hasOwnProperty("channel"))
            if (!$util.isInteger(message.channel))
                return "channel: integer expected";
        return null;
    };

    /**
     * Creates a WifiConnectedState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WifiConnectedState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WifiConnectedState} WifiConnectedState
     */
    WifiConnectedState.fromObject = function fromObject(object) {
        if (object instanceof $root.WifiConnectedState)
            return object;
        let message = new $root.WifiConnectedState();
        if (object.ip4Addr != null)
            message.ip4Addr = String(object.ip4Addr);
        switch (object.authMode) {
        default:
            if (typeof object.authMode === "number") {
                message.authMode = object.authMode;
                break;
            }
            break;
        case "Open":
        case 0:
            message.authMode = 0;
            break;
        case "WEP":
        case 1:
            message.authMode = 1;
            break;
        case "WPA_PSK":
        case 2:
            message.authMode = 2;
            break;
        case "WPA2_PSK":
        case 3:
            message.authMode = 3;
            break;
        case "WPA_WPA2_PSK":
        case 4:
            message.authMode = 4;
            break;
        case "WPA2_ENTERPRISE":
        case 5:
            message.authMode = 5;
            break;
        case "WPA3_PSK":
        case 6:
            message.authMode = 6;
            break;
        case "WPA2_WPA3_PSK":
        case 7:
            message.authMode = 7;
            break;
        }
        if (object.ssid != null)
            if (typeof object.ssid === "string")
                $util.base64.decode(object.ssid, message.ssid = $util.newBuffer($util.base64.length(object.ssid)), 0);
            else if (object.ssid.length >= 0)
                message.ssid = object.ssid;
        if (object.bssid != null)
            if (typeof object.bssid === "string")
                $util.base64.decode(object.bssid, message.bssid = $util.newBuffer($util.base64.length(object.bssid)), 0);
            else if (object.bssid.length >= 0)
                message.bssid = object.bssid;
        if (object.channel != null)
            message.channel = object.channel | 0;
        return message;
    };

    /**
     * Creates a plain object from a WifiConnectedState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WifiConnectedState
     * @static
     * @param {WifiConnectedState} message WifiConnectedState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WifiConnectedState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.ip4Addr = "";
            object.authMode = options.enums === String ? "Open" : 0;
            if (options.bytes === String)
                object.ssid = "";
            else {
                object.ssid = [];
                if (options.bytes !== Array)
                    object.ssid = $util.newBuffer(object.ssid);
            }
            if (options.bytes === String)
                object.bssid = "";
            else {
                object.bssid = [];
                if (options.bytes !== Array)
                    object.bssid = $util.newBuffer(object.bssid);
            }
            object.channel = 0;
        }
        if (message.ip4Addr != null && message.hasOwnProperty("ip4Addr"))
            object.ip4Addr = message.ip4Addr;
        if (message.authMode != null && message.hasOwnProperty("authMode"))
            object.authMode = options.enums === String ? $root.WifiAuthMode[message.authMode] === undefined ? message.authMode : $root.WifiAuthMode[message.authMode] : message.authMode;
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            object.ssid = options.bytes === String ? $util.base64.encode(message.ssid, 0, message.ssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.ssid) : message.ssid;
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            object.bssid = options.bytes === String ? $util.base64.encode(message.bssid, 0, message.bssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.bssid) : message.bssid;
        if (message.channel != null && message.hasOwnProperty("channel"))
            object.channel = message.channel;
        return object;
    };

    /**
     * Converts this WifiConnectedState to JSON.
     * @function toJSON
     * @memberof WifiConnectedState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WifiConnectedState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WifiConnectedState
     * @function getTypeUrl
     * @memberof WifiConnectedState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WifiConnectedState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WifiConnectedState";
    };

    return WifiConnectedState;
})();

export const CmdCtrlReset = $root.CmdCtrlReset = (() => {

    /**
     * Properties of a CmdCtrlReset.
     * @exports ICmdCtrlReset
     * @interface ICmdCtrlReset
     */

    /**
     * Constructs a new CmdCtrlReset.
     * @exports CmdCtrlReset
     * @classdesc Represents a CmdCtrlReset.
     * @implements ICmdCtrlReset
     * @constructor
     * @param {ICmdCtrlReset=} [properties] Properties to set
     */
    function CmdCtrlReset(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CmdCtrlReset instance using the specified properties.
     * @function create
     * @memberof CmdCtrlReset
     * @static
     * @param {ICmdCtrlReset=} [properties] Properties to set
     * @returns {CmdCtrlReset} CmdCtrlReset instance
     */
    CmdCtrlReset.create = function create(properties) {
        return new CmdCtrlReset(properties);
    };

    /**
     * Encodes the specified CmdCtrlReset message. Does not implicitly {@link CmdCtrlReset.verify|verify} messages.
     * @function encode
     * @memberof CmdCtrlReset
     * @static
     * @param {ICmdCtrlReset} message CmdCtrlReset message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdCtrlReset.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CmdCtrlReset message, length delimited. Does not implicitly {@link CmdCtrlReset.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdCtrlReset
     * @static
     * @param {ICmdCtrlReset} message CmdCtrlReset message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdCtrlReset.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdCtrlReset message from the specified reader or buffer.
     * @function decode
     * @memberof CmdCtrlReset
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdCtrlReset} CmdCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdCtrlReset.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdCtrlReset();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdCtrlReset message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdCtrlReset
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdCtrlReset} CmdCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdCtrlReset.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdCtrlReset message.
     * @function verify
     * @memberof CmdCtrlReset
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdCtrlReset.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CmdCtrlReset message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdCtrlReset
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdCtrlReset} CmdCtrlReset
     */
    CmdCtrlReset.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdCtrlReset)
            return object;
        return new $root.CmdCtrlReset();
    };

    /**
     * Creates a plain object from a CmdCtrlReset message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdCtrlReset
     * @static
     * @param {CmdCtrlReset} message CmdCtrlReset
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdCtrlReset.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CmdCtrlReset to JSON.
     * @function toJSON
     * @memberof CmdCtrlReset
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdCtrlReset.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdCtrlReset
     * @function getTypeUrl
     * @memberof CmdCtrlReset
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdCtrlReset.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdCtrlReset";
    };

    return CmdCtrlReset;
})();

export const RespCtrlReset = $root.RespCtrlReset = (() => {

    /**
     * Properties of a RespCtrlReset.
     * @exports IRespCtrlReset
     * @interface IRespCtrlReset
     */

    /**
     * Constructs a new RespCtrlReset.
     * @exports RespCtrlReset
     * @classdesc Represents a RespCtrlReset.
     * @implements IRespCtrlReset
     * @constructor
     * @param {IRespCtrlReset=} [properties] Properties to set
     */
    function RespCtrlReset(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new RespCtrlReset instance using the specified properties.
     * @function create
     * @memberof RespCtrlReset
     * @static
     * @param {IRespCtrlReset=} [properties] Properties to set
     * @returns {RespCtrlReset} RespCtrlReset instance
     */
    RespCtrlReset.create = function create(properties) {
        return new RespCtrlReset(properties);
    };

    /**
     * Encodes the specified RespCtrlReset message. Does not implicitly {@link RespCtrlReset.verify|verify} messages.
     * @function encode
     * @memberof RespCtrlReset
     * @static
     * @param {IRespCtrlReset} message RespCtrlReset message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespCtrlReset.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified RespCtrlReset message, length delimited. Does not implicitly {@link RespCtrlReset.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespCtrlReset
     * @static
     * @param {IRespCtrlReset} message RespCtrlReset message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespCtrlReset.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespCtrlReset message from the specified reader or buffer.
     * @function decode
     * @memberof RespCtrlReset
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespCtrlReset} RespCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespCtrlReset.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespCtrlReset();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespCtrlReset message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespCtrlReset
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespCtrlReset} RespCtrlReset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespCtrlReset.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespCtrlReset message.
     * @function verify
     * @memberof RespCtrlReset
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespCtrlReset.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a RespCtrlReset message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespCtrlReset
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespCtrlReset} RespCtrlReset
     */
    RespCtrlReset.fromObject = function fromObject(object) {
        if (object instanceof $root.RespCtrlReset)
            return object;
        return new $root.RespCtrlReset();
    };

    /**
     * Creates a plain object from a RespCtrlReset message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespCtrlReset
     * @static
     * @param {RespCtrlReset} message RespCtrlReset
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespCtrlReset.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this RespCtrlReset to JSON.
     * @function toJSON
     * @memberof RespCtrlReset
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespCtrlReset.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespCtrlReset
     * @function getTypeUrl
     * @memberof RespCtrlReset
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespCtrlReset.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespCtrlReset";
    };

    return RespCtrlReset;
})();

export const CmdCtrlReprov = $root.CmdCtrlReprov = (() => {

    /**
     * Properties of a CmdCtrlReprov.
     * @exports ICmdCtrlReprov
     * @interface ICmdCtrlReprov
     */

    /**
     * Constructs a new CmdCtrlReprov.
     * @exports CmdCtrlReprov
     * @classdesc Represents a CmdCtrlReprov.
     * @implements ICmdCtrlReprov
     * @constructor
     * @param {ICmdCtrlReprov=} [properties] Properties to set
     */
    function CmdCtrlReprov(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CmdCtrlReprov instance using the specified properties.
     * @function create
     * @memberof CmdCtrlReprov
     * @static
     * @param {ICmdCtrlReprov=} [properties] Properties to set
     * @returns {CmdCtrlReprov} CmdCtrlReprov instance
     */
    CmdCtrlReprov.create = function create(properties) {
        return new CmdCtrlReprov(properties);
    };

    /**
     * Encodes the specified CmdCtrlReprov message. Does not implicitly {@link CmdCtrlReprov.verify|verify} messages.
     * @function encode
     * @memberof CmdCtrlReprov
     * @static
     * @param {ICmdCtrlReprov} message CmdCtrlReprov message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdCtrlReprov.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CmdCtrlReprov message, length delimited. Does not implicitly {@link CmdCtrlReprov.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdCtrlReprov
     * @static
     * @param {ICmdCtrlReprov} message CmdCtrlReprov message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdCtrlReprov.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdCtrlReprov message from the specified reader or buffer.
     * @function decode
     * @memberof CmdCtrlReprov
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdCtrlReprov} CmdCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdCtrlReprov.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdCtrlReprov();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdCtrlReprov message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdCtrlReprov
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdCtrlReprov} CmdCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdCtrlReprov.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdCtrlReprov message.
     * @function verify
     * @memberof CmdCtrlReprov
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdCtrlReprov.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CmdCtrlReprov message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdCtrlReprov
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdCtrlReprov} CmdCtrlReprov
     */
    CmdCtrlReprov.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdCtrlReprov)
            return object;
        return new $root.CmdCtrlReprov();
    };

    /**
     * Creates a plain object from a CmdCtrlReprov message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdCtrlReprov
     * @static
     * @param {CmdCtrlReprov} message CmdCtrlReprov
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdCtrlReprov.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CmdCtrlReprov to JSON.
     * @function toJSON
     * @memberof CmdCtrlReprov
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdCtrlReprov.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdCtrlReprov
     * @function getTypeUrl
     * @memberof CmdCtrlReprov
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdCtrlReprov.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdCtrlReprov";
    };

    return CmdCtrlReprov;
})();

export const RespCtrlReprov = $root.RespCtrlReprov = (() => {

    /**
     * Properties of a RespCtrlReprov.
     * @exports IRespCtrlReprov
     * @interface IRespCtrlReprov
     */

    /**
     * Constructs a new RespCtrlReprov.
     * @exports RespCtrlReprov
     * @classdesc Represents a RespCtrlReprov.
     * @implements IRespCtrlReprov
     * @constructor
     * @param {IRespCtrlReprov=} [properties] Properties to set
     */
    function RespCtrlReprov(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new RespCtrlReprov instance using the specified properties.
     * @function create
     * @memberof RespCtrlReprov
     * @static
     * @param {IRespCtrlReprov=} [properties] Properties to set
     * @returns {RespCtrlReprov} RespCtrlReprov instance
     */
    RespCtrlReprov.create = function create(properties) {
        return new RespCtrlReprov(properties);
    };

    /**
     * Encodes the specified RespCtrlReprov message. Does not implicitly {@link RespCtrlReprov.verify|verify} messages.
     * @function encode
     * @memberof RespCtrlReprov
     * @static
     * @param {IRespCtrlReprov} message RespCtrlReprov message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespCtrlReprov.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified RespCtrlReprov message, length delimited. Does not implicitly {@link RespCtrlReprov.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespCtrlReprov
     * @static
     * @param {IRespCtrlReprov} message RespCtrlReprov message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespCtrlReprov.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespCtrlReprov message from the specified reader or buffer.
     * @function decode
     * @memberof RespCtrlReprov
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespCtrlReprov} RespCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespCtrlReprov.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespCtrlReprov();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespCtrlReprov message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespCtrlReprov
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespCtrlReprov} RespCtrlReprov
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespCtrlReprov.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespCtrlReprov message.
     * @function verify
     * @memberof RespCtrlReprov
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespCtrlReprov.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a RespCtrlReprov message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespCtrlReprov
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespCtrlReprov} RespCtrlReprov
     */
    RespCtrlReprov.fromObject = function fromObject(object) {
        if (object instanceof $root.RespCtrlReprov)
            return object;
        return new $root.RespCtrlReprov();
    };

    /**
     * Creates a plain object from a RespCtrlReprov message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespCtrlReprov
     * @static
     * @param {RespCtrlReprov} message RespCtrlReprov
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespCtrlReprov.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this RespCtrlReprov to JSON.
     * @function toJSON
     * @memberof RespCtrlReprov
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespCtrlReprov.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespCtrlReprov
     * @function getTypeUrl
     * @memberof RespCtrlReprov
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespCtrlReprov.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespCtrlReprov";
    };

    return RespCtrlReprov;
})();

/**
 * WiFiCtrlMsgType enum.
 * @exports WiFiCtrlMsgType
 * @enum {number}
 * @property {number} TypeCtrlReserved=0 TypeCtrlReserved value
 * @property {number} TypeCmdCtrlReset=1 TypeCmdCtrlReset value
 * @property {number} TypeRespCtrlReset=2 TypeRespCtrlReset value
 * @property {number} TypeCmdCtrlReprov=3 TypeCmdCtrlReprov value
 * @property {number} TypeRespCtrlReprov=4 TypeRespCtrlReprov value
 */
export const WiFiCtrlMsgType = $root.WiFiCtrlMsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "TypeCtrlReserved"] = 0;
    values[valuesById[1] = "TypeCmdCtrlReset"] = 1;
    values[valuesById[2] = "TypeRespCtrlReset"] = 2;
    values[valuesById[3] = "TypeCmdCtrlReprov"] = 3;
    values[valuesById[4] = "TypeRespCtrlReprov"] = 4;
    return values;
})();

export const WiFiCtrlPayload = $root.WiFiCtrlPayload = (() => {

    /**
     * Properties of a WiFiCtrlPayload.
     * @exports IWiFiCtrlPayload
     * @interface IWiFiCtrlPayload
     * @property {WiFiCtrlMsgType|null} [msg] WiFiCtrlPayload msg
     * @property {Status|null} [status] WiFiCtrlPayload status
     * @property {ICmdCtrlReset|null} [cmdCtrlReset] WiFiCtrlPayload cmdCtrlReset
     * @property {IRespCtrlReset|null} [respCtrlReset] WiFiCtrlPayload respCtrlReset
     * @property {ICmdCtrlReprov|null} [cmdCtrlReprov] WiFiCtrlPayload cmdCtrlReprov
     * @property {IRespCtrlReprov|null} [respCtrlReprov] WiFiCtrlPayload respCtrlReprov
     */

    /**
     * Constructs a new WiFiCtrlPayload.
     * @exports WiFiCtrlPayload
     * @classdesc Represents a WiFiCtrlPayload.
     * @implements IWiFiCtrlPayload
     * @constructor
     * @param {IWiFiCtrlPayload=} [properties] Properties to set
     */
    function WiFiCtrlPayload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WiFiCtrlPayload msg.
     * @member {WiFiCtrlMsgType} msg
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.msg = 0;

    /**
     * WiFiCtrlPayload status.
     * @member {Status} status
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.status = 0;

    /**
     * WiFiCtrlPayload cmdCtrlReset.
     * @member {ICmdCtrlReset|null|undefined} cmdCtrlReset
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.cmdCtrlReset = null;

    /**
     * WiFiCtrlPayload respCtrlReset.
     * @member {IRespCtrlReset|null|undefined} respCtrlReset
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.respCtrlReset = null;

    /**
     * WiFiCtrlPayload cmdCtrlReprov.
     * @member {ICmdCtrlReprov|null|undefined} cmdCtrlReprov
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.cmdCtrlReprov = null;

    /**
     * WiFiCtrlPayload respCtrlReprov.
     * @member {IRespCtrlReprov|null|undefined} respCtrlReprov
     * @memberof WiFiCtrlPayload
     * @instance
     */
    WiFiCtrlPayload.prototype.respCtrlReprov = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * WiFiCtrlPayload payload.
     * @member {"cmdCtrlReset"|"respCtrlReset"|"cmdCtrlReprov"|"respCtrlReprov"|undefined} payload
     * @memberof WiFiCtrlPayload
     * @instance
     */
    Object.defineProperty(WiFiCtrlPayload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["cmdCtrlReset", "respCtrlReset", "cmdCtrlReprov", "respCtrlReprov"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new WiFiCtrlPayload instance using the specified properties.
     * @function create
     * @memberof WiFiCtrlPayload
     * @static
     * @param {IWiFiCtrlPayload=} [properties] Properties to set
     * @returns {WiFiCtrlPayload} WiFiCtrlPayload instance
     */
    WiFiCtrlPayload.create = function create(properties) {
        return new WiFiCtrlPayload(properties);
    };

    /**
     * Encodes the specified WiFiCtrlPayload message. Does not implicitly {@link WiFiCtrlPayload.verify|verify} messages.
     * @function encode
     * @memberof WiFiCtrlPayload
     * @static
     * @param {IWiFiCtrlPayload} message WiFiCtrlPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiCtrlPayload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
        if (message.cmdCtrlReset != null && Object.hasOwnProperty.call(message, "cmdCtrlReset"))
            $root.CmdCtrlReset.encode(message.cmdCtrlReset, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.respCtrlReset != null && Object.hasOwnProperty.call(message, "respCtrlReset"))
            $root.RespCtrlReset.encode(message.respCtrlReset, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        if (message.cmdCtrlReprov != null && Object.hasOwnProperty.call(message, "cmdCtrlReprov"))
            $root.CmdCtrlReprov.encode(message.cmdCtrlReprov, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
        if (message.respCtrlReprov != null && Object.hasOwnProperty.call(message, "respCtrlReprov"))
            $root.RespCtrlReprov.encode(message.respCtrlReprov, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified WiFiCtrlPayload message, length delimited. Does not implicitly {@link WiFiCtrlPayload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WiFiCtrlPayload
     * @static
     * @param {IWiFiCtrlPayload} message WiFiCtrlPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiCtrlPayload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WiFiCtrlPayload message from the specified reader or buffer.
     * @function decode
     * @memberof WiFiCtrlPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WiFiCtrlPayload} WiFiCtrlPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiCtrlPayload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WiFiCtrlPayload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 2: {
                    message.status = reader.int32();
                    break;
                }
            case 11: {
                    message.cmdCtrlReset = $root.CmdCtrlReset.decode(reader, reader.uint32());
                    break;
                }
            case 12: {
                    message.respCtrlReset = $root.RespCtrlReset.decode(reader, reader.uint32());
                    break;
                }
            case 13: {
                    message.cmdCtrlReprov = $root.CmdCtrlReprov.decode(reader, reader.uint32());
                    break;
                }
            case 14: {
                    message.respCtrlReprov = $root.RespCtrlReprov.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a WiFiCtrlPayload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WiFiCtrlPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WiFiCtrlPayload} WiFiCtrlPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiCtrlPayload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WiFiCtrlPayload message.
     * @function verify
     * @memberof WiFiCtrlPayload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WiFiCtrlPayload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.cmdCtrlReset != null && message.hasOwnProperty("cmdCtrlReset")) {
            properties.payload = 1;
            {
                let error = $root.CmdCtrlReset.verify(message.cmdCtrlReset);
                if (error)
                    return "cmdCtrlReset." + error;
            }
        }
        if (message.respCtrlReset != null && message.hasOwnProperty("respCtrlReset")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespCtrlReset.verify(message.respCtrlReset);
                if (error)
                    return "respCtrlReset." + error;
            }
        }
        if (message.cmdCtrlReprov != null && message.hasOwnProperty("cmdCtrlReprov")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.CmdCtrlReprov.verify(message.cmdCtrlReprov);
                if (error)
                    return "cmdCtrlReprov." + error;
            }
        }
        if (message.respCtrlReprov != null && message.hasOwnProperty("respCtrlReprov")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespCtrlReprov.verify(message.respCtrlReprov);
                if (error)
                    return "respCtrlReprov." + error;
            }
        }
        return null;
    };

    /**
     * Creates a WiFiCtrlPayload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WiFiCtrlPayload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WiFiCtrlPayload} WiFiCtrlPayload
     */
    WiFiCtrlPayload.fromObject = function fromObject(object) {
        if (object instanceof $root.WiFiCtrlPayload)
            return object;
        let message = new $root.WiFiCtrlPayload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "TypeCtrlReserved":
        case 0:
            message.msg = 0;
            break;
        case "TypeCmdCtrlReset":
        case 1:
            message.msg = 1;
            break;
        case "TypeRespCtrlReset":
        case 2:
            message.msg = 2;
            break;
        case "TypeCmdCtrlReprov":
        case 3:
            message.msg = 3;
            break;
        case "TypeRespCtrlReprov":
        case 4:
            message.msg = 4;
            break;
        }
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.cmdCtrlReset != null) {
            if (typeof object.cmdCtrlReset !== "object")
                throw TypeError(".WiFiCtrlPayload.cmdCtrlReset: object expected");
            message.cmdCtrlReset = $root.CmdCtrlReset.fromObject(object.cmdCtrlReset);
        }
        if (object.respCtrlReset != null) {
            if (typeof object.respCtrlReset !== "object")
                throw TypeError(".WiFiCtrlPayload.respCtrlReset: object expected");
            message.respCtrlReset = $root.RespCtrlReset.fromObject(object.respCtrlReset);
        }
        if (object.cmdCtrlReprov != null) {
            if (typeof object.cmdCtrlReprov !== "object")
                throw TypeError(".WiFiCtrlPayload.cmdCtrlReprov: object expected");
            message.cmdCtrlReprov = $root.CmdCtrlReprov.fromObject(object.cmdCtrlReprov);
        }
        if (object.respCtrlReprov != null) {
            if (typeof object.respCtrlReprov !== "object")
                throw TypeError(".WiFiCtrlPayload.respCtrlReprov: object expected");
            message.respCtrlReprov = $root.RespCtrlReprov.fromObject(object.respCtrlReprov);
        }
        return message;
    };

    /**
     * Creates a plain object from a WiFiCtrlPayload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WiFiCtrlPayload
     * @static
     * @param {WiFiCtrlPayload} message WiFiCtrlPayload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WiFiCtrlPayload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.msg = options.enums === String ? "TypeCtrlReserved" : 0;
            object.status = options.enums === String ? "Success" : 0;
        }
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.WiFiCtrlMsgType[message.msg] === undefined ? message.msg : $root.WiFiCtrlMsgType[message.msg] : message.msg;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.cmdCtrlReset != null && message.hasOwnProperty("cmdCtrlReset")) {
            object.cmdCtrlReset = $root.CmdCtrlReset.toObject(message.cmdCtrlReset, options);
            if (options.oneofs)
                object.payload = "cmdCtrlReset";
        }
        if (message.respCtrlReset != null && message.hasOwnProperty("respCtrlReset")) {
            object.respCtrlReset = $root.RespCtrlReset.toObject(message.respCtrlReset, options);
            if (options.oneofs)
                object.payload = "respCtrlReset";
        }
        if (message.cmdCtrlReprov != null && message.hasOwnProperty("cmdCtrlReprov")) {
            object.cmdCtrlReprov = $root.CmdCtrlReprov.toObject(message.cmdCtrlReprov, options);
            if (options.oneofs)
                object.payload = "cmdCtrlReprov";
        }
        if (message.respCtrlReprov != null && message.hasOwnProperty("respCtrlReprov")) {
            object.respCtrlReprov = $root.RespCtrlReprov.toObject(message.respCtrlReprov, options);
            if (options.oneofs)
                object.payload = "respCtrlReprov";
        }
        return object;
    };

    /**
     * Converts this WiFiCtrlPayload to JSON.
     * @function toJSON
     * @memberof WiFiCtrlPayload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WiFiCtrlPayload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WiFiCtrlPayload
     * @function getTypeUrl
     * @memberof WiFiCtrlPayload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WiFiCtrlPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WiFiCtrlPayload";
    };

    return WiFiCtrlPayload;
})();

export const CmdScanStart = $root.CmdScanStart = (() => {

    /**
     * Properties of a CmdScanStart.
     * @exports ICmdScanStart
     * @interface ICmdScanStart
     * @property {boolean|null} [blocking] CmdScanStart blocking
     * @property {boolean|null} [passive] CmdScanStart passive
     * @property {number|null} [groupChannels] CmdScanStart groupChannels
     * @property {number|null} [periodMs] CmdScanStart periodMs
     */

    /**
     * Constructs a new CmdScanStart.
     * @exports CmdScanStart
     * @classdesc Represents a CmdScanStart.
     * @implements ICmdScanStart
     * @constructor
     * @param {ICmdScanStart=} [properties] Properties to set
     */
    function CmdScanStart(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CmdScanStart blocking.
     * @member {boolean} blocking
     * @memberof CmdScanStart
     * @instance
     */
    CmdScanStart.prototype.blocking = false;

    /**
     * CmdScanStart passive.
     * @member {boolean} passive
     * @memberof CmdScanStart
     * @instance
     */
    CmdScanStart.prototype.passive = false;

    /**
     * CmdScanStart groupChannels.
     * @member {number} groupChannels
     * @memberof CmdScanStart
     * @instance
     */
    CmdScanStart.prototype.groupChannels = 0;

    /**
     * CmdScanStart periodMs.
     * @member {number} periodMs
     * @memberof CmdScanStart
     * @instance
     */
    CmdScanStart.prototype.periodMs = 0;

    /**
     * Creates a new CmdScanStart instance using the specified properties.
     * @function create
     * @memberof CmdScanStart
     * @static
     * @param {ICmdScanStart=} [properties] Properties to set
     * @returns {CmdScanStart} CmdScanStart instance
     */
    CmdScanStart.create = function create(properties) {
        return new CmdScanStart(properties);
    };

    /**
     * Encodes the specified CmdScanStart message. Does not implicitly {@link CmdScanStart.verify|verify} messages.
     * @function encode
     * @memberof CmdScanStart
     * @static
     * @param {ICmdScanStart} message CmdScanStart message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanStart.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.blocking != null && Object.hasOwnProperty.call(message, "blocking"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.blocking);
        if (message.passive != null && Object.hasOwnProperty.call(message, "passive"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.passive);
        if (message.groupChannels != null && Object.hasOwnProperty.call(message, "groupChannels"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.groupChannels);
        if (message.periodMs != null && Object.hasOwnProperty.call(message, "periodMs"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.periodMs);
        return writer;
    };

    /**
     * Encodes the specified CmdScanStart message, length delimited. Does not implicitly {@link CmdScanStart.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdScanStart
     * @static
     * @param {ICmdScanStart} message CmdScanStart message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanStart.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdScanStart message from the specified reader or buffer.
     * @function decode
     * @memberof CmdScanStart
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdScanStart} CmdScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanStart.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdScanStart();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.blocking = reader.bool();
                    break;
                }
            case 2: {
                    message.passive = reader.bool();
                    break;
                }
            case 3: {
                    message.groupChannels = reader.uint32();
                    break;
                }
            case 4: {
                    message.periodMs = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdScanStart message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdScanStart
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdScanStart} CmdScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanStart.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdScanStart message.
     * @function verify
     * @memberof CmdScanStart
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdScanStart.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.blocking != null && message.hasOwnProperty("blocking"))
            if (typeof message.blocking !== "boolean")
                return "blocking: boolean expected";
        if (message.passive != null && message.hasOwnProperty("passive"))
            if (typeof message.passive !== "boolean")
                return "passive: boolean expected";
        if (message.groupChannels != null && message.hasOwnProperty("groupChannels"))
            if (!$util.isInteger(message.groupChannels))
                return "groupChannels: integer expected";
        if (message.periodMs != null && message.hasOwnProperty("periodMs"))
            if (!$util.isInteger(message.periodMs))
                return "periodMs: integer expected";
        return null;
    };

    /**
     * Creates a CmdScanStart message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdScanStart
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdScanStart} CmdScanStart
     */
    CmdScanStart.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdScanStart)
            return object;
        let message = new $root.CmdScanStart();
        if (object.blocking != null)
            message.blocking = Boolean(object.blocking);
        if (object.passive != null)
            message.passive = Boolean(object.passive);
        if (object.groupChannels != null)
            message.groupChannels = object.groupChannels >>> 0;
        if (object.periodMs != null)
            message.periodMs = object.periodMs >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a CmdScanStart message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdScanStart
     * @static
     * @param {CmdScanStart} message CmdScanStart
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdScanStart.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.blocking = false;
            object.passive = false;
            object.groupChannels = 0;
            object.periodMs = 0;
        }
        if (message.blocking != null && message.hasOwnProperty("blocking"))
            object.blocking = message.blocking;
        if (message.passive != null && message.hasOwnProperty("passive"))
            object.passive = message.passive;
        if (message.groupChannels != null && message.hasOwnProperty("groupChannels"))
            object.groupChannels = message.groupChannels;
        if (message.periodMs != null && message.hasOwnProperty("periodMs"))
            object.periodMs = message.periodMs;
        return object;
    };

    /**
     * Converts this CmdScanStart to JSON.
     * @function toJSON
     * @memberof CmdScanStart
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdScanStart.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdScanStart
     * @function getTypeUrl
     * @memberof CmdScanStart
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdScanStart.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdScanStart";
    };

    return CmdScanStart;
})();

export const RespScanStart = $root.RespScanStart = (() => {

    /**
     * Properties of a RespScanStart.
     * @exports IRespScanStart
     * @interface IRespScanStart
     */

    /**
     * Constructs a new RespScanStart.
     * @exports RespScanStart
     * @classdesc Represents a RespScanStart.
     * @implements IRespScanStart
     * @constructor
     * @param {IRespScanStart=} [properties] Properties to set
     */
    function RespScanStart(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new RespScanStart instance using the specified properties.
     * @function create
     * @memberof RespScanStart
     * @static
     * @param {IRespScanStart=} [properties] Properties to set
     * @returns {RespScanStart} RespScanStart instance
     */
    RespScanStart.create = function create(properties) {
        return new RespScanStart(properties);
    };

    /**
     * Encodes the specified RespScanStart message. Does not implicitly {@link RespScanStart.verify|verify} messages.
     * @function encode
     * @memberof RespScanStart
     * @static
     * @param {IRespScanStart} message RespScanStart message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanStart.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified RespScanStart message, length delimited. Does not implicitly {@link RespScanStart.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespScanStart
     * @static
     * @param {IRespScanStart} message RespScanStart message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanStart.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespScanStart message from the specified reader or buffer.
     * @function decode
     * @memberof RespScanStart
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespScanStart} RespScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanStart.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespScanStart();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespScanStart message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespScanStart
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespScanStart} RespScanStart
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanStart.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespScanStart message.
     * @function verify
     * @memberof RespScanStart
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespScanStart.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a RespScanStart message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespScanStart
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespScanStart} RespScanStart
     */
    RespScanStart.fromObject = function fromObject(object) {
        if (object instanceof $root.RespScanStart)
            return object;
        return new $root.RespScanStart();
    };

    /**
     * Creates a plain object from a RespScanStart message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespScanStart
     * @static
     * @param {RespScanStart} message RespScanStart
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespScanStart.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this RespScanStart to JSON.
     * @function toJSON
     * @memberof RespScanStart
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespScanStart.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespScanStart
     * @function getTypeUrl
     * @memberof RespScanStart
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespScanStart.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespScanStart";
    };

    return RespScanStart;
})();

export const CmdScanStatus = $root.CmdScanStatus = (() => {

    /**
     * Properties of a CmdScanStatus.
     * @exports ICmdScanStatus
     * @interface ICmdScanStatus
     */

    /**
     * Constructs a new CmdScanStatus.
     * @exports CmdScanStatus
     * @classdesc Represents a CmdScanStatus.
     * @implements ICmdScanStatus
     * @constructor
     * @param {ICmdScanStatus=} [properties] Properties to set
     */
    function CmdScanStatus(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CmdScanStatus instance using the specified properties.
     * @function create
     * @memberof CmdScanStatus
     * @static
     * @param {ICmdScanStatus=} [properties] Properties to set
     * @returns {CmdScanStatus} CmdScanStatus instance
     */
    CmdScanStatus.create = function create(properties) {
        return new CmdScanStatus(properties);
    };

    /**
     * Encodes the specified CmdScanStatus message. Does not implicitly {@link CmdScanStatus.verify|verify} messages.
     * @function encode
     * @memberof CmdScanStatus
     * @static
     * @param {ICmdScanStatus} message CmdScanStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanStatus.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CmdScanStatus message, length delimited. Does not implicitly {@link CmdScanStatus.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdScanStatus
     * @static
     * @param {ICmdScanStatus} message CmdScanStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanStatus.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdScanStatus message from the specified reader or buffer.
     * @function decode
     * @memberof CmdScanStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdScanStatus} CmdScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanStatus.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdScanStatus();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdScanStatus message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdScanStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdScanStatus} CmdScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanStatus.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdScanStatus message.
     * @function verify
     * @memberof CmdScanStatus
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdScanStatus.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CmdScanStatus message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdScanStatus
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdScanStatus} CmdScanStatus
     */
    CmdScanStatus.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdScanStatus)
            return object;
        return new $root.CmdScanStatus();
    };

    /**
     * Creates a plain object from a CmdScanStatus message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdScanStatus
     * @static
     * @param {CmdScanStatus} message CmdScanStatus
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdScanStatus.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CmdScanStatus to JSON.
     * @function toJSON
     * @memberof CmdScanStatus
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdScanStatus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdScanStatus
     * @function getTypeUrl
     * @memberof CmdScanStatus
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdScanStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdScanStatus";
    };

    return CmdScanStatus;
})();

export const RespScanStatus = $root.RespScanStatus = (() => {

    /**
     * Properties of a RespScanStatus.
     * @exports IRespScanStatus
     * @interface IRespScanStatus
     * @property {boolean|null} [scanFinished] RespScanStatus scanFinished
     * @property {number|null} [resultCount] RespScanStatus resultCount
     */

    /**
     * Constructs a new RespScanStatus.
     * @exports RespScanStatus
     * @classdesc Represents a RespScanStatus.
     * @implements IRespScanStatus
     * @constructor
     * @param {IRespScanStatus=} [properties] Properties to set
     */
    function RespScanStatus(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RespScanStatus scanFinished.
     * @member {boolean} scanFinished
     * @memberof RespScanStatus
     * @instance
     */
    RespScanStatus.prototype.scanFinished = false;

    /**
     * RespScanStatus resultCount.
     * @member {number} resultCount
     * @memberof RespScanStatus
     * @instance
     */
    RespScanStatus.prototype.resultCount = 0;

    /**
     * Creates a new RespScanStatus instance using the specified properties.
     * @function create
     * @memberof RespScanStatus
     * @static
     * @param {IRespScanStatus=} [properties] Properties to set
     * @returns {RespScanStatus} RespScanStatus instance
     */
    RespScanStatus.create = function create(properties) {
        return new RespScanStatus(properties);
    };

    /**
     * Encodes the specified RespScanStatus message. Does not implicitly {@link RespScanStatus.verify|verify} messages.
     * @function encode
     * @memberof RespScanStatus
     * @static
     * @param {IRespScanStatus} message RespScanStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanStatus.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.scanFinished != null && Object.hasOwnProperty.call(message, "scanFinished"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.scanFinished);
        if (message.resultCount != null && Object.hasOwnProperty.call(message, "resultCount"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.resultCount);
        return writer;
    };

    /**
     * Encodes the specified RespScanStatus message, length delimited. Does not implicitly {@link RespScanStatus.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespScanStatus
     * @static
     * @param {IRespScanStatus} message RespScanStatus message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanStatus.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespScanStatus message from the specified reader or buffer.
     * @function decode
     * @memberof RespScanStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespScanStatus} RespScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanStatus.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespScanStatus();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.scanFinished = reader.bool();
                    break;
                }
            case 2: {
                    message.resultCount = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespScanStatus message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespScanStatus
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespScanStatus} RespScanStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanStatus.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespScanStatus message.
     * @function verify
     * @memberof RespScanStatus
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespScanStatus.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.scanFinished != null && message.hasOwnProperty("scanFinished"))
            if (typeof message.scanFinished !== "boolean")
                return "scanFinished: boolean expected";
        if (message.resultCount != null && message.hasOwnProperty("resultCount"))
            if (!$util.isInteger(message.resultCount))
                return "resultCount: integer expected";
        return null;
    };

    /**
     * Creates a RespScanStatus message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespScanStatus
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespScanStatus} RespScanStatus
     */
    RespScanStatus.fromObject = function fromObject(object) {
        if (object instanceof $root.RespScanStatus)
            return object;
        let message = new $root.RespScanStatus();
        if (object.scanFinished != null)
            message.scanFinished = Boolean(object.scanFinished);
        if (object.resultCount != null)
            message.resultCount = object.resultCount >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a RespScanStatus message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespScanStatus
     * @static
     * @param {RespScanStatus} message RespScanStatus
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespScanStatus.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.scanFinished = false;
            object.resultCount = 0;
        }
        if (message.scanFinished != null && message.hasOwnProperty("scanFinished"))
            object.scanFinished = message.scanFinished;
        if (message.resultCount != null && message.hasOwnProperty("resultCount"))
            object.resultCount = message.resultCount;
        return object;
    };

    /**
     * Converts this RespScanStatus to JSON.
     * @function toJSON
     * @memberof RespScanStatus
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespScanStatus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespScanStatus
     * @function getTypeUrl
     * @memberof RespScanStatus
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespScanStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespScanStatus";
    };

    return RespScanStatus;
})();

export const CmdScanResult = $root.CmdScanResult = (() => {

    /**
     * Properties of a CmdScanResult.
     * @exports ICmdScanResult
     * @interface ICmdScanResult
     * @property {number|null} [startIndex] CmdScanResult startIndex
     * @property {number|null} [count] CmdScanResult count
     */

    /**
     * Constructs a new CmdScanResult.
     * @exports CmdScanResult
     * @classdesc Represents a CmdScanResult.
     * @implements ICmdScanResult
     * @constructor
     * @param {ICmdScanResult=} [properties] Properties to set
     */
    function CmdScanResult(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CmdScanResult startIndex.
     * @member {number} startIndex
     * @memberof CmdScanResult
     * @instance
     */
    CmdScanResult.prototype.startIndex = 0;

    /**
     * CmdScanResult count.
     * @member {number} count
     * @memberof CmdScanResult
     * @instance
     */
    CmdScanResult.prototype.count = 0;

    /**
     * Creates a new CmdScanResult instance using the specified properties.
     * @function create
     * @memberof CmdScanResult
     * @static
     * @param {ICmdScanResult=} [properties] Properties to set
     * @returns {CmdScanResult} CmdScanResult instance
     */
    CmdScanResult.create = function create(properties) {
        return new CmdScanResult(properties);
    };

    /**
     * Encodes the specified CmdScanResult message. Does not implicitly {@link CmdScanResult.verify|verify} messages.
     * @function encode
     * @memberof CmdScanResult
     * @static
     * @param {ICmdScanResult} message CmdScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanResult.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.startIndex != null && Object.hasOwnProperty.call(message, "startIndex"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.startIndex);
        if (message.count != null && Object.hasOwnProperty.call(message, "count"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.count);
        return writer;
    };

    /**
     * Encodes the specified CmdScanResult message, length delimited. Does not implicitly {@link CmdScanResult.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CmdScanResult
     * @static
     * @param {ICmdScanResult} message CmdScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CmdScanResult.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CmdScanResult message from the specified reader or buffer.
     * @function decode
     * @memberof CmdScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CmdScanResult} CmdScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanResult.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CmdScanResult();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.startIndex = reader.uint32();
                    break;
                }
            case 2: {
                    message.count = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CmdScanResult message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CmdScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CmdScanResult} CmdScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CmdScanResult.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CmdScanResult message.
     * @function verify
     * @memberof CmdScanResult
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CmdScanResult.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.startIndex != null && message.hasOwnProperty("startIndex"))
            if (!$util.isInteger(message.startIndex))
                return "startIndex: integer expected";
        if (message.count != null && message.hasOwnProperty("count"))
            if (!$util.isInteger(message.count))
                return "count: integer expected";
        return null;
    };

    /**
     * Creates a CmdScanResult message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CmdScanResult
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CmdScanResult} CmdScanResult
     */
    CmdScanResult.fromObject = function fromObject(object) {
        if (object instanceof $root.CmdScanResult)
            return object;
        let message = new $root.CmdScanResult();
        if (object.startIndex != null)
            message.startIndex = object.startIndex >>> 0;
        if (object.count != null)
            message.count = object.count >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a CmdScanResult message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CmdScanResult
     * @static
     * @param {CmdScanResult} message CmdScanResult
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CmdScanResult.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.startIndex = 0;
            object.count = 0;
        }
        if (message.startIndex != null && message.hasOwnProperty("startIndex"))
            object.startIndex = message.startIndex;
        if (message.count != null && message.hasOwnProperty("count"))
            object.count = message.count;
        return object;
    };

    /**
     * Converts this CmdScanResult to JSON.
     * @function toJSON
     * @memberof CmdScanResult
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CmdScanResult.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CmdScanResult
     * @function getTypeUrl
     * @memberof CmdScanResult
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CmdScanResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CmdScanResult";
    };

    return CmdScanResult;
})();

export const WiFiScanResult = $root.WiFiScanResult = (() => {

    /**
     * Properties of a WiFiScanResult.
     * @exports IWiFiScanResult
     * @interface IWiFiScanResult
     * @property {Uint8Array|null} [ssid] WiFiScanResult ssid
     * @property {number|null} [channel] WiFiScanResult channel
     * @property {number|null} [rssi] WiFiScanResult rssi
     * @property {Uint8Array|null} [bssid] WiFiScanResult bssid
     * @property {WifiAuthMode|null} [auth] WiFiScanResult auth
     */

    /**
     * Constructs a new WiFiScanResult.
     * @exports WiFiScanResult
     * @classdesc Represents a WiFiScanResult.
     * @implements IWiFiScanResult
     * @constructor
     * @param {IWiFiScanResult=} [properties] Properties to set
     */
    function WiFiScanResult(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WiFiScanResult ssid.
     * @member {Uint8Array} ssid
     * @memberof WiFiScanResult
     * @instance
     */
    WiFiScanResult.prototype.ssid = $util.newBuffer([]);

    /**
     * WiFiScanResult channel.
     * @member {number} channel
     * @memberof WiFiScanResult
     * @instance
     */
    WiFiScanResult.prototype.channel = 0;

    /**
     * WiFiScanResult rssi.
     * @member {number} rssi
     * @memberof WiFiScanResult
     * @instance
     */
    WiFiScanResult.prototype.rssi = 0;

    /**
     * WiFiScanResult bssid.
     * @member {Uint8Array} bssid
     * @memberof WiFiScanResult
     * @instance
     */
    WiFiScanResult.prototype.bssid = $util.newBuffer([]);

    /**
     * WiFiScanResult auth.
     * @member {WifiAuthMode} auth
     * @memberof WiFiScanResult
     * @instance
     */
    WiFiScanResult.prototype.auth = 0;

    /**
     * Creates a new WiFiScanResult instance using the specified properties.
     * @function create
     * @memberof WiFiScanResult
     * @static
     * @param {IWiFiScanResult=} [properties] Properties to set
     * @returns {WiFiScanResult} WiFiScanResult instance
     */
    WiFiScanResult.create = function create(properties) {
        return new WiFiScanResult(properties);
    };

    /**
     * Encodes the specified WiFiScanResult message. Does not implicitly {@link WiFiScanResult.verify|verify} messages.
     * @function encode
     * @memberof WiFiScanResult
     * @static
     * @param {IWiFiScanResult} message WiFiScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiScanResult.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.ssid != null && Object.hasOwnProperty.call(message, "ssid"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ssid);
        if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.channel);
        if (message.rssi != null && Object.hasOwnProperty.call(message, "rssi"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.rssi);
        if (message.bssid != null && Object.hasOwnProperty.call(message, "bssid"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.bssid);
        if (message.auth != null && Object.hasOwnProperty.call(message, "auth"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.auth);
        return writer;
    };

    /**
     * Encodes the specified WiFiScanResult message, length delimited. Does not implicitly {@link WiFiScanResult.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WiFiScanResult
     * @static
     * @param {IWiFiScanResult} message WiFiScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiScanResult.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WiFiScanResult message from the specified reader or buffer.
     * @function decode
     * @memberof WiFiScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WiFiScanResult} WiFiScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiScanResult.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WiFiScanResult();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.ssid = reader.bytes();
                    break;
                }
            case 2: {
                    message.channel = reader.uint32();
                    break;
                }
            case 3: {
                    message.rssi = reader.int32();
                    break;
                }
            case 4: {
                    message.bssid = reader.bytes();
                    break;
                }
            case 5: {
                    message.auth = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a WiFiScanResult message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WiFiScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WiFiScanResult} WiFiScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiScanResult.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WiFiScanResult message.
     * @function verify
     * @memberof WiFiScanResult
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WiFiScanResult.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            if (!(message.ssid && typeof message.ssid.length === "number" || $util.isString(message.ssid)))
                return "ssid: buffer expected";
        if (message.channel != null && message.hasOwnProperty("channel"))
            if (!$util.isInteger(message.channel))
                return "channel: integer expected";
        if (message.rssi != null && message.hasOwnProperty("rssi"))
            if (!$util.isInteger(message.rssi))
                return "rssi: integer expected";
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            if (!(message.bssid && typeof message.bssid.length === "number" || $util.isString(message.bssid)))
                return "bssid: buffer expected";
        if (message.auth != null && message.hasOwnProperty("auth"))
            switch (message.auth) {
            default:
                return "auth: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        return null;
    };

    /**
     * Creates a WiFiScanResult message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WiFiScanResult
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WiFiScanResult} WiFiScanResult
     */
    WiFiScanResult.fromObject = function fromObject(object) {
        if (object instanceof $root.WiFiScanResult)
            return object;
        let message = new $root.WiFiScanResult();
        if (object.ssid != null)
            if (typeof object.ssid === "string")
                $util.base64.decode(object.ssid, message.ssid = $util.newBuffer($util.base64.length(object.ssid)), 0);
            else if (object.ssid.length >= 0)
                message.ssid = object.ssid;
        if (object.channel != null)
            message.channel = object.channel >>> 0;
        if (object.rssi != null)
            message.rssi = object.rssi | 0;
        if (object.bssid != null)
            if (typeof object.bssid === "string")
                $util.base64.decode(object.bssid, message.bssid = $util.newBuffer($util.base64.length(object.bssid)), 0);
            else if (object.bssid.length >= 0)
                message.bssid = object.bssid;
        switch (object.auth) {
        default:
            if (typeof object.auth === "number") {
                message.auth = object.auth;
                break;
            }
            break;
        case "Open":
        case 0:
            message.auth = 0;
            break;
        case "WEP":
        case 1:
            message.auth = 1;
            break;
        case "WPA_PSK":
        case 2:
            message.auth = 2;
            break;
        case "WPA2_PSK":
        case 3:
            message.auth = 3;
            break;
        case "WPA_WPA2_PSK":
        case 4:
            message.auth = 4;
            break;
        case "WPA2_ENTERPRISE":
        case 5:
            message.auth = 5;
            break;
        case "WPA3_PSK":
        case 6:
            message.auth = 6;
            break;
        case "WPA2_WPA3_PSK":
        case 7:
            message.auth = 7;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a WiFiScanResult message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WiFiScanResult
     * @static
     * @param {WiFiScanResult} message WiFiScanResult
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WiFiScanResult.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.ssid = "";
            else {
                object.ssid = [];
                if (options.bytes !== Array)
                    object.ssid = $util.newBuffer(object.ssid);
            }
            object.channel = 0;
            object.rssi = 0;
            if (options.bytes === String)
                object.bssid = "";
            else {
                object.bssid = [];
                if (options.bytes !== Array)
                    object.bssid = $util.newBuffer(object.bssid);
            }
            object.auth = options.enums === String ? "Open" : 0;
        }
        if (message.ssid != null && message.hasOwnProperty("ssid"))
            object.ssid = options.bytes === String ? $util.base64.encode(message.ssid, 0, message.ssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.ssid) : message.ssid;
        if (message.channel != null && message.hasOwnProperty("channel"))
            object.channel = message.channel;
        if (message.rssi != null && message.hasOwnProperty("rssi"))
            object.rssi = message.rssi;
        if (message.bssid != null && message.hasOwnProperty("bssid"))
            object.bssid = options.bytes === String ? $util.base64.encode(message.bssid, 0, message.bssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.bssid) : message.bssid;
        if (message.auth != null && message.hasOwnProperty("auth"))
            object.auth = options.enums === String ? $root.WifiAuthMode[message.auth] === undefined ? message.auth : $root.WifiAuthMode[message.auth] : message.auth;
        return object;
    };

    /**
     * Converts this WiFiScanResult to JSON.
     * @function toJSON
     * @memberof WiFiScanResult
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WiFiScanResult.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WiFiScanResult
     * @function getTypeUrl
     * @memberof WiFiScanResult
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WiFiScanResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WiFiScanResult";
    };

    return WiFiScanResult;
})();

export const RespScanResult = $root.RespScanResult = (() => {

    /**
     * Properties of a RespScanResult.
     * @exports IRespScanResult
     * @interface IRespScanResult
     * @property {Array.<IWiFiScanResult>|null} [entries] RespScanResult entries
     */

    /**
     * Constructs a new RespScanResult.
     * @exports RespScanResult
     * @classdesc Represents a RespScanResult.
     * @implements IRespScanResult
     * @constructor
     * @param {IRespScanResult=} [properties] Properties to set
     */
    function RespScanResult(properties) {
        this.entries = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RespScanResult entries.
     * @member {Array.<IWiFiScanResult>} entries
     * @memberof RespScanResult
     * @instance
     */
    RespScanResult.prototype.entries = $util.emptyArray;

    /**
     * Creates a new RespScanResult instance using the specified properties.
     * @function create
     * @memberof RespScanResult
     * @static
     * @param {IRespScanResult=} [properties] Properties to set
     * @returns {RespScanResult} RespScanResult instance
     */
    RespScanResult.create = function create(properties) {
        return new RespScanResult(properties);
    };

    /**
     * Encodes the specified RespScanResult message. Does not implicitly {@link RespScanResult.verify|verify} messages.
     * @function encode
     * @memberof RespScanResult
     * @static
     * @param {IRespScanResult} message RespScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanResult.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.entries != null && message.entries.length)
            for (let i = 0; i < message.entries.length; ++i)
                $root.WiFiScanResult.encode(message.entries[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified RespScanResult message, length delimited. Does not implicitly {@link RespScanResult.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RespScanResult
     * @static
     * @param {IRespScanResult} message RespScanResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RespScanResult.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RespScanResult message from the specified reader or buffer.
     * @function decode
     * @memberof RespScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RespScanResult} RespScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanResult.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.RespScanResult();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.entries && message.entries.length))
                        message.entries = [];
                    message.entries.push($root.WiFiScanResult.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RespScanResult message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RespScanResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RespScanResult} RespScanResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RespScanResult.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RespScanResult message.
     * @function verify
     * @memberof RespScanResult
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RespScanResult.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.entries != null && message.hasOwnProperty("entries")) {
            if (!Array.isArray(message.entries))
                return "entries: array expected";
            for (let i = 0; i < message.entries.length; ++i) {
                let error = $root.WiFiScanResult.verify(message.entries[i]);
                if (error)
                    return "entries." + error;
            }
        }
        return null;
    };

    /**
     * Creates a RespScanResult message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RespScanResult
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RespScanResult} RespScanResult
     */
    RespScanResult.fromObject = function fromObject(object) {
        if (object instanceof $root.RespScanResult)
            return object;
        let message = new $root.RespScanResult();
        if (object.entries) {
            if (!Array.isArray(object.entries))
                throw TypeError(".RespScanResult.entries: array expected");
            message.entries = [];
            for (let i = 0; i < object.entries.length; ++i) {
                if (typeof object.entries[i] !== "object")
                    throw TypeError(".RespScanResult.entries: object expected");
                message.entries[i] = $root.WiFiScanResult.fromObject(object.entries[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a RespScanResult message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RespScanResult
     * @static
     * @param {RespScanResult} message RespScanResult
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RespScanResult.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.entries = [];
        if (message.entries && message.entries.length) {
            object.entries = [];
            for (let j = 0; j < message.entries.length; ++j)
                object.entries[j] = $root.WiFiScanResult.toObject(message.entries[j], options);
        }
        return object;
    };

    /**
     * Converts this RespScanResult to JSON.
     * @function toJSON
     * @memberof RespScanResult
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RespScanResult.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RespScanResult
     * @function getTypeUrl
     * @memberof RespScanResult
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RespScanResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RespScanResult";
    };

    return RespScanResult;
})();

/**
 * WiFiScanMsgType enum.
 * @exports WiFiScanMsgType
 * @enum {number}
 * @property {number} TypeCmdScanStart=0 TypeCmdScanStart value
 * @property {number} TypeRespScanStart=1 TypeRespScanStart value
 * @property {number} TypeCmdScanStatus=2 TypeCmdScanStatus value
 * @property {number} TypeRespScanStatus=3 TypeRespScanStatus value
 * @property {number} TypeCmdScanResult=4 TypeCmdScanResult value
 * @property {number} TypeRespScanResult=5 TypeRespScanResult value
 */
export const WiFiScanMsgType = $root.WiFiScanMsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "TypeCmdScanStart"] = 0;
    values[valuesById[1] = "TypeRespScanStart"] = 1;
    values[valuesById[2] = "TypeCmdScanStatus"] = 2;
    values[valuesById[3] = "TypeRespScanStatus"] = 3;
    values[valuesById[4] = "TypeCmdScanResult"] = 4;
    values[valuesById[5] = "TypeRespScanResult"] = 5;
    return values;
})();

export const WiFiScanPayload = $root.WiFiScanPayload = (() => {

    /**
     * Properties of a WiFiScanPayload.
     * @exports IWiFiScanPayload
     * @interface IWiFiScanPayload
     * @property {WiFiScanMsgType|null} [msg] WiFiScanPayload msg
     * @property {Status|null} [status] WiFiScanPayload status
     * @property {ICmdScanStart|null} [cmdScanStart] WiFiScanPayload cmdScanStart
     * @property {IRespScanStart|null} [respScanStart] WiFiScanPayload respScanStart
     * @property {ICmdScanStatus|null} [cmdScanStatus] WiFiScanPayload cmdScanStatus
     * @property {IRespScanStatus|null} [respScanStatus] WiFiScanPayload respScanStatus
     * @property {ICmdScanResult|null} [cmdScanResult] WiFiScanPayload cmdScanResult
     * @property {IRespScanResult|null} [respScanResult] WiFiScanPayload respScanResult
     */

    /**
     * Constructs a new WiFiScanPayload.
     * @exports WiFiScanPayload
     * @classdesc Represents a WiFiScanPayload.
     * @implements IWiFiScanPayload
     * @constructor
     * @param {IWiFiScanPayload=} [properties] Properties to set
     */
    function WiFiScanPayload(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WiFiScanPayload msg.
     * @member {WiFiScanMsgType} msg
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.msg = 0;

    /**
     * WiFiScanPayload status.
     * @member {Status} status
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.status = 0;

    /**
     * WiFiScanPayload cmdScanStart.
     * @member {ICmdScanStart|null|undefined} cmdScanStart
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.cmdScanStart = null;

    /**
     * WiFiScanPayload respScanStart.
     * @member {IRespScanStart|null|undefined} respScanStart
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.respScanStart = null;

    /**
     * WiFiScanPayload cmdScanStatus.
     * @member {ICmdScanStatus|null|undefined} cmdScanStatus
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.cmdScanStatus = null;

    /**
     * WiFiScanPayload respScanStatus.
     * @member {IRespScanStatus|null|undefined} respScanStatus
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.respScanStatus = null;

    /**
     * WiFiScanPayload cmdScanResult.
     * @member {ICmdScanResult|null|undefined} cmdScanResult
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.cmdScanResult = null;

    /**
     * WiFiScanPayload respScanResult.
     * @member {IRespScanResult|null|undefined} respScanResult
     * @memberof WiFiScanPayload
     * @instance
     */
    WiFiScanPayload.prototype.respScanResult = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * WiFiScanPayload payload.
     * @member {"cmdScanStart"|"respScanStart"|"cmdScanStatus"|"respScanStatus"|"cmdScanResult"|"respScanResult"|undefined} payload
     * @memberof WiFiScanPayload
     * @instance
     */
    Object.defineProperty(WiFiScanPayload.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["cmdScanStart", "respScanStart", "cmdScanStatus", "respScanStatus", "cmdScanResult", "respScanResult"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new WiFiScanPayload instance using the specified properties.
     * @function create
     * @memberof WiFiScanPayload
     * @static
     * @param {IWiFiScanPayload=} [properties] Properties to set
     * @returns {WiFiScanPayload} WiFiScanPayload instance
     */
    WiFiScanPayload.create = function create(properties) {
        return new WiFiScanPayload(properties);
    };

    /**
     * Encodes the specified WiFiScanPayload message. Does not implicitly {@link WiFiScanPayload.verify|verify} messages.
     * @function encode
     * @memberof WiFiScanPayload
     * @static
     * @param {IWiFiScanPayload} message WiFiScanPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiScanPayload.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
        if (message.cmdScanStart != null && Object.hasOwnProperty.call(message, "cmdScanStart"))
            $root.CmdScanStart.encode(message.cmdScanStart, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.respScanStart != null && Object.hasOwnProperty.call(message, "respScanStart"))
            $root.RespScanStart.encode(message.respScanStart, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.cmdScanStatus != null && Object.hasOwnProperty.call(message, "cmdScanStatus"))
            $root.CmdScanStatus.encode(message.cmdScanStatus, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        if (message.respScanStatus != null && Object.hasOwnProperty.call(message, "respScanStatus"))
            $root.RespScanStatus.encode(message.respScanStatus, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
        if (message.cmdScanResult != null && Object.hasOwnProperty.call(message, "cmdScanResult"))
            $root.CmdScanResult.encode(message.cmdScanResult, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        if (message.respScanResult != null && Object.hasOwnProperty.call(message, "respScanResult"))
            $root.RespScanResult.encode(message.respScanResult, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified WiFiScanPayload message, length delimited. Does not implicitly {@link WiFiScanPayload.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WiFiScanPayload
     * @static
     * @param {IWiFiScanPayload} message WiFiScanPayload message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WiFiScanPayload.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WiFiScanPayload message from the specified reader or buffer.
     * @function decode
     * @memberof WiFiScanPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WiFiScanPayload} WiFiScanPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiScanPayload.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WiFiScanPayload();
        while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.msg = reader.int32();
                    break;
                }
            case 2: {
                    message.status = reader.int32();
                    break;
                }
            case 10: {
                    message.cmdScanStart = $root.CmdScanStart.decode(reader, reader.uint32());
                    break;
                }
            case 11: {
                    message.respScanStart = $root.RespScanStart.decode(reader, reader.uint32());
                    break;
                }
            case 12: {
                    message.cmdScanStatus = $root.CmdScanStatus.decode(reader, reader.uint32());
                    break;
                }
            case 13: {
                    message.respScanStatus = $root.RespScanStatus.decode(reader, reader.uint32());
                    break;
                }
            case 14: {
                    message.cmdScanResult = $root.CmdScanResult.decode(reader, reader.uint32());
                    break;
                }
            case 15: {
                    message.respScanResult = $root.RespScanResult.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a WiFiScanPayload message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WiFiScanPayload
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WiFiScanPayload} WiFiScanPayload
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WiFiScanPayload.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WiFiScanPayload message.
     * @function verify
     * @memberof WiFiScanPayload
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WiFiScanPayload.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.msg != null && message.hasOwnProperty("msg"))
            switch (message.msg) {
            default:
                return "msg: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
        if (message.status != null && message.hasOwnProperty("status"))
            switch (message.status) {
            default:
                return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.cmdScanStart != null && message.hasOwnProperty("cmdScanStart")) {
            properties.payload = 1;
            {
                let error = $root.CmdScanStart.verify(message.cmdScanStart);
                if (error)
                    return "cmdScanStart." + error;
            }
        }
        if (message.respScanStart != null && message.hasOwnProperty("respScanStart")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespScanStart.verify(message.respScanStart);
                if (error)
                    return "respScanStart." + error;
            }
        }
        if (message.cmdScanStatus != null && message.hasOwnProperty("cmdScanStatus")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.CmdScanStatus.verify(message.cmdScanStatus);
                if (error)
                    return "cmdScanStatus." + error;
            }
        }
        if (message.respScanStatus != null && message.hasOwnProperty("respScanStatus")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespScanStatus.verify(message.respScanStatus);
                if (error)
                    return "respScanStatus." + error;
            }
        }
        if (message.cmdScanResult != null && message.hasOwnProperty("cmdScanResult")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.CmdScanResult.verify(message.cmdScanResult);
                if (error)
                    return "cmdScanResult." + error;
            }
        }
        if (message.respScanResult != null && message.hasOwnProperty("respScanResult")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                let error = $root.RespScanResult.verify(message.respScanResult);
                if (error)
                    return "respScanResult." + error;
            }
        }
        return null;
    };

    /**
     * Creates a WiFiScanPayload message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WiFiScanPayload
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WiFiScanPayload} WiFiScanPayload
     */
    WiFiScanPayload.fromObject = function fromObject(object) {
        if (object instanceof $root.WiFiScanPayload)
            return object;
        let message = new $root.WiFiScanPayload();
        switch (object.msg) {
        default:
            if (typeof object.msg === "number") {
                message.msg = object.msg;
                break;
            }
            break;
        case "TypeCmdScanStart":
        case 0:
            message.msg = 0;
            break;
        case "TypeRespScanStart":
        case 1:
            message.msg = 1;
            break;
        case "TypeCmdScanStatus":
        case 2:
            message.msg = 2;
            break;
        case "TypeRespScanStatus":
        case 3:
            message.msg = 3;
            break;
        case "TypeCmdScanResult":
        case 4:
            message.msg = 4;
            break;
        case "TypeRespScanResult":
        case 5:
            message.msg = 5;
            break;
        }
        switch (object.status) {
        default:
            if (typeof object.status === "number") {
                message.status = object.status;
                break;
            }
            break;
        case "Success":
        case 0:
            message.status = 0;
            break;
        case "InvalidSecScheme":
        case 1:
            message.status = 1;
            break;
        case "InvalidProto":
        case 2:
            message.status = 2;
            break;
        case "TooManySessions":
        case 3:
            message.status = 3;
            break;
        case "InvalidArgument":
        case 4:
            message.status = 4;
            break;
        case "InternalError":
        case 5:
            message.status = 5;
            break;
        case "CryptoError":
        case 6:
            message.status = 6;
            break;
        case "InvalidSession":
        case 7:
            message.status = 7;
            break;
        }
        if (object.cmdScanStart != null) {
            if (typeof object.cmdScanStart !== "object")
                throw TypeError(".WiFiScanPayload.cmdScanStart: object expected");
            message.cmdScanStart = $root.CmdScanStart.fromObject(object.cmdScanStart);
        }
        if (object.respScanStart != null) {
            if (typeof object.respScanStart !== "object")
                throw TypeError(".WiFiScanPayload.respScanStart: object expected");
            message.respScanStart = $root.RespScanStart.fromObject(object.respScanStart);
        }
        if (object.cmdScanStatus != null) {
            if (typeof object.cmdScanStatus !== "object")
                throw TypeError(".WiFiScanPayload.cmdScanStatus: object expected");
            message.cmdScanStatus = $root.CmdScanStatus.fromObject(object.cmdScanStatus);
        }
        if (object.respScanStatus != null) {
            if (typeof object.respScanStatus !== "object")
                throw TypeError(".WiFiScanPayload.respScanStatus: object expected");
            message.respScanStatus = $root.RespScanStatus.fromObject(object.respScanStatus);
        }
        if (object.cmdScanResult != null) {
            if (typeof object.cmdScanResult !== "object")
                throw TypeError(".WiFiScanPayload.cmdScanResult: object expected");
            message.cmdScanResult = $root.CmdScanResult.fromObject(object.cmdScanResult);
        }
        if (object.respScanResult != null) {
            if (typeof object.respScanResult !== "object")
                throw TypeError(".WiFiScanPayload.respScanResult: object expected");
            message.respScanResult = $root.RespScanResult.fromObject(object.respScanResult);
        }
        return message;
    };

    /**
     * Creates a plain object from a WiFiScanPayload message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WiFiScanPayload
     * @static
     * @param {WiFiScanPayload} message WiFiScanPayload
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WiFiScanPayload.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.msg = options.enums === String ? "TypeCmdScanStart" : 0;
            object.status = options.enums === String ? "Success" : 0;
        }
        if (message.msg != null && message.hasOwnProperty("msg"))
            object.msg = options.enums === String ? $root.WiFiScanMsgType[message.msg] === undefined ? message.msg : $root.WiFiScanMsgType[message.msg] : message.msg;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = options.enums === String ? $root.Status[message.status] === undefined ? message.status : $root.Status[message.status] : message.status;
        if (message.cmdScanStart != null && message.hasOwnProperty("cmdScanStart")) {
            object.cmdScanStart = $root.CmdScanStart.toObject(message.cmdScanStart, options);
            if (options.oneofs)
                object.payload = "cmdScanStart";
        }
        if (message.respScanStart != null && message.hasOwnProperty("respScanStart")) {
            object.respScanStart = $root.RespScanStart.toObject(message.respScanStart, options);
            if (options.oneofs)
                object.payload = "respScanStart";
        }
        if (message.cmdScanStatus != null && message.hasOwnProperty("cmdScanStatus")) {
            object.cmdScanStatus = $root.CmdScanStatus.toObject(message.cmdScanStatus, options);
            if (options.oneofs)
                object.payload = "cmdScanStatus";
        }
        if (message.respScanStatus != null && message.hasOwnProperty("respScanStatus")) {
            object.respScanStatus = $root.RespScanStatus.toObject(message.respScanStatus, options);
            if (options.oneofs)
                object.payload = "respScanStatus";
        }
        if (message.cmdScanResult != null && message.hasOwnProperty("cmdScanResult")) {
            object.cmdScanResult = $root.CmdScanResult.toObject(message.cmdScanResult, options);
            if (options.oneofs)
                object.payload = "cmdScanResult";
        }
        if (message.respScanResult != null && message.hasOwnProperty("respScanResult")) {
            object.respScanResult = $root.RespScanResult.toObject(message.respScanResult, options);
            if (options.oneofs)
                object.payload = "respScanResult";
        }
        return object;
    };

    /**
     * Converts this WiFiScanPayload to JSON.
     * @function toJSON
     * @memberof WiFiScanPayload
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WiFiScanPayload.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WiFiScanPayload
     * @function getTypeUrl
     * @memberof WiFiScanPayload
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WiFiScanPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WiFiScanPayload";
    };

    return WiFiScanPayload;
})();

export { $root as default };
