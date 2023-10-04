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
exports.settingsCallbackx = exports.sendAttendanceCallback = exports.adminAttendanceCallback = exports.adminSFCallback = exports.sendsfFunctions = exports.botOnFunctions = exports.dbFunctions = exports.startCallback = exports.Command = exports.adminbdayCallback = exports.adminWelfareCallback = exports.sendWishCallback = void 0;
exports.sendWishCallback = __importStar(require("./_sendWishCallback"));
exports.adminWelfareCallback = __importStar(require("./_adminWelfareCallbacks"));
exports.adminbdayCallback = __importStar(require("./_adminBdayCallbacks"));
exports.Command = __importStar(require("./_commands"));
exports.startCallback = __importStar(require("./_startCallbacks"));
exports.dbFunctions = __importStar(require("./_db_functions"));
exports.botOnFunctions = __importStar(require("./_botOn_functions"));
exports.sendsfFunctions = __importStar(require("./_sendSFCallback"));
exports.adminSFCallback = __importStar(require("./_adminSFCallbacks"));
exports.adminAttendanceCallback = __importStar(require("./_adminAttendanceCallbacks"));
exports.sendAttendanceCallback = __importStar(require("./_sendAttendanceCallbacks"));
exports.settingsCallbackx = __importStar(require("./_settingsCallbacks"));
