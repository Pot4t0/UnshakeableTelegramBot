"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botOnHandler = void 0;
const _index_1 = require("../database_mongoDB/functions/_index");
const _index_2 = require("../cmd/send/_index");
const _index_3 = require("../cmd/admin/_index");
const _index_4 = require("../cmd/settings/_index");
const _telefunctions_1 = require("../app/_telefunctions");
// BotOn Functions
// Case 1: /sendwish BotOn Functions
const botOnHandler = (bot) => {
    bot.on(':user_shared', _telefunctions_1.loadFunction, userSharedListener);
    bot.on(':chat_shared', _telefunctions_1.loadFunction, chatSharedListener);
    bot.on('message', _telefunctions_1.loadFunction, anyMsgListener);
};
exports.botOnHandler = botOnHandler;
const anyMsgListener = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    switch (ctx.session.botOnType) {
        // /sendwish BotOn Functions
        //Refer to finalWish Method in sendWishCallback.ts
        //Used for receiving wish msg
        case 1: {
            yield _index_2.sendWishBotOn.sendWish_Execution(ctx);
            break;
        }
        // /DbFunctions BotOn Functions
        //Used for receiving reminders for all users that did not send in reminders
        case 2: {
            yield _index_1.reminder.reminderSendAllNotIn_Execution(ctx);
            break;
        }
        //Used for receiving reminders for specific reminder
        //Used for receiving reminders for all users that did not send in reminders
        case 3: {
            yield _index_1.reminder.sendSpecificReminder_Execution(ctx);
            break;
        }
        //eventDB BotOn Functions
        // Add Event Date Message
        case 4: {
            yield _index_1.eventDB.addEvent_ReceiveEventName(ctx);
            break;
        }
        //Add NotAllowedUser Meassage
        case 5: {
            yield _index_1.eventDB.addEvent_ReceiveEventDate(ctx);
            break;
        }
        //Used for editing welfare events (Event Name)
        case 6: {
            yield _index_1.eventDB.editEventName_Execution(ctx);
            break;
        }
        //Used for editing welfare events (Event Dtae)
        case 7: {
            yield _index_1.eventDB.editEventDate_Execution(ctx);
            break;
        }
        // sendSF BotOn Functions
        // Used for sending sf msg to google sheets
        case 8: {
            yield _index_2.sendsfBotOn.sendToSheet_SF(ctx);
            break;
        }
        // Used for sending reason msg to google sheets
        case 9: {
            yield _index_2.sendsfBotOn.sendToSheet_Reason(ctx);
            break;
        }
        // /adminsf BotOn Functions
        case 30: {
            yield _index_3.adminSFBotOn.manualSFNo(ctx);
            break;
        }
        // sendattendance BotOn Functions
        case 19: {
            yield _index_2.sendAttendanceBotOn.WeAttendanceLogReason(ctx);
            break;
        }
        case 20: {
            yield _index_2.sendAttendanceBotOn.lgAttendanceLogReason(ctx);
            break;
        }
        // /adminattendance
        case 21: {
            yield _index_3.adminAttendanceBotOn.addAttendanceSheet_LGEventWEDateMessage(ctx);
            break;
        }
        case 22: {
            yield _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateLGEventSheet(ctx);
            break;
        }
        //Add without LG
        case 23: {
            yield _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateNoLGEventSheet(ctx);
            break;
        }
        //reminders
        case 24: {
            yield _index_3.adminAttendanceBotOn.addAttendanceSheet_SpecialEventDateMessage(ctx);
            break;
        }
        case 25: {
            yield _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateSpecialEventSheet(ctx);
            break;
        }
        // /sendattendance Special Event Logging Reason
        case 28: {
            yield _index_2.sendAttendanceBotOn.SpecialAttendanceLogReason(ctx);
            break;
        }
        case 29: {
            yield _index_2.sendAttendanceBotOn.dinnerAttendanceReason(ctx);
            break;
        }
        // /settings announcements
        // Used for sending out announcement msg
        case 31: {
            yield _index_4.settingBotOn.settingsAnnouncements_Send(ctx);
            break;
        }
        // /settings new user
        // Used for adding new user
        // User Full Name
        case 32: {
            yield _index_4.settingBotOn.addUser_FullName(ctx);
            break;
        }
        default: {
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                yield ctx.reply('Sorry I do not understand. Please try again!');
        }
    }
});
const userSharedListener = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const request_id = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.user_shared.request_id;
    switch (request_id) {
        // /settings new user
        // Used to get full name of new user
        case 1:
            _index_4.settingBotOn.addUser(ctx);
            break;
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                yield ctx.reply('Sorry I do not understand. Please try again!');
    }
});
const chatSharedListener = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const request_id = (_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.chat_shared.request_id;
    switch (request_id) {
        case 1:
            _index_4.settingBotOn.changeLGChat(ctx);
            break;
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                yield ctx.reply('Sorry I do not understand. Please try again!');
    }
});
