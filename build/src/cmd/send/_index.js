"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.sendClaimBotOn = exports.sendWishBotOn = exports.sendsfBotOn = exports.sendAttendanceBotOn = void 0;
const _sendAttendanceCallbacks_1 = require("./attendance/_sendAttendanceCallbacks");
const _sendSFCallback_1 = require("./sf/_sendSFCallback");
const _sendWishCallback_1 = require("./wish/_sendWishCallback");
const _claimCallbacks_1 = require("./claim/_claimCallbacks");
//Send Bot On Functions
exports.sendAttendanceBotOn = __importStar(require("./attendance/_sendAttendanceBotOn"));
exports.sendsfBotOn = __importStar(require("./sf/_sendSFBotOn"));
exports.sendWishBotOn = __importStar(require("./wish/_sendWishBotOn"));
exports.sendClaimBotOn = __importStar(require("./claim/_claimBotOn"));
/**
 * send Class (Callbacks)
 * - Collection of send commands.
 */
class send {
    /**
     * Sends attendance command.
     * @param bot The Bot instance.
     */
    static attendance(bot) {
        (0, _sendAttendanceCallbacks_1.sendAttendance)(bot);
    }
    /**
     * Sends wish command.
     * @param bot The Bot instance.
     */
    static wish(bot) {
        (0, _sendWishCallback_1.sendWish)(bot);
    }
    /**
     * Sends sf command.
     * @param bot The Bot instance.
     */
    static sf(bot) {
        (0, _sendSFCallback_1.sendsf)(bot);
    }
    /**
     * Sends claim command.
     * @param bot The Bot instance.
     */
    static claim(bot) {
        (0, _claimCallbacks_1.sendClaim)(bot);
    }
}
exports.send = send;
