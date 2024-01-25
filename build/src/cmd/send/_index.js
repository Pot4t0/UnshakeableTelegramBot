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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.sendWishBotOn = exports.sendsfBotOn = exports.sendAttendanceBotOn = void 0;
const _sendAttendanceCallbacks_1 = require("./attendance/_sendAttendanceCallbacks");
const _sendSFCallback_1 = require("./sf/_sendSFCallback");
const _sendWishCallback_1 = require("./wish/_sendWishCallback");
//Send Bot On Functions
exports.sendAttendanceBotOn = __importStar(require("./attendance/_sendAttendanceBotOn"));
exports.sendsfBotOn = __importStar(require("./sf/_sendSFBotOn"));
exports.sendWishBotOn = __importStar(require("./wish/_sendWishBotOn"));
//Send Callbacks Functions
class send {
    //   static callback = class {
    static attendance(bot) {
        (0, _sendAttendanceCallbacks_1.sendAttendance)(bot);
    }
    static wish(bot) {
        (0, _sendWishCallback_1.sendWish)(bot);
    }
    static sf(bot) {
        (0, _sendSFCallback_1.sendsf)(bot);
    }
}
exports.send = send;
