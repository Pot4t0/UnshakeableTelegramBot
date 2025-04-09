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
/**
 * admin Class (Callbacks)
 * - Collection of admin commands.
 * - This class contains all the admin commands.
 */
class admin {
    /**
     * Admin Attendance command.
     * @param bot The Bot instance.
     */
    static attendance(bot) {
        (0, _adminAttendanceCallbacks_1.adminAttendance)(bot);
    }
    /**
     * Admin Welfare command.
     * @param bot The Bot instance.
     */
    static welfare(bot) {
        (0, _adminWelfareCallbacks_1.adminWelfare)(bot);
    }
    /**
     * Admin Birthday command.
     * @param bot The Bot instance.
     */
    static bday(bot) {
        (0, _adminBdayCallbacks_1.adminBday)(bot);
    }
    /**
     * Admin SF command.
     * @param bot The Bot instance.
     */
    static sf(bot) {
        (0, _adminSFCallbacks_1.adminSF)(bot);
    }
    /**
     * Admin Finance command.
     * @param bot The Bot instance.
     */
    static finance(bot) {
        (0, _financeCallbacks_1.adminFinance)(bot);
    }
}
exports.admin = admin;
