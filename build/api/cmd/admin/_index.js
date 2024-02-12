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
exports.admin = exports.adminFinanceBotOn = exports.adminSFBotOn = exports.adminAttendanceBotOn = void 0;
const _adminAttendanceCallbacks_1 = require("./attendance/_adminAttendanceCallbacks");
const _adminWelfareCallbacks_1 = require("./_adminWelfareCallbacks");
const _adminBdayCallbacks_1 = require("./_adminBdayCallbacks");
const _adminSFCallbacks_1 = require("./sf/_adminSFCallbacks");
const _financeCallbacks_1 = require("./finance/_financeCallbacks");
//Admin Bot On Functions
exports.adminAttendanceBotOn = __importStar(require("./attendance/_adminAttendanceBotOn"));
exports.adminSFBotOn = __importStar(require("./sf/_adminSFBotOn"));
exports.adminFinanceBotOn = __importStar(require("./finance/_financeBotOn"));
//Admin Callback Functions
class admin {
    static attendance(bot) {
        (0, _adminAttendanceCallbacks_1.adminAttendance)(bot);
    }
    static welfare(bot) {
        (0, _adminWelfareCallbacks_1.adminWelfare)(bot);
    }
    static bday(bot) {
        (0, _adminBdayCallbacks_1.adminBday)(bot);
    }
    static sf(bot) {
        (0, _adminSFCallbacks_1.adminSF)(bot);
    }
    static finance(bot) {
        (0, _financeCallbacks_1.adminFinance)(bot);
    }
}
exports.admin = admin;
