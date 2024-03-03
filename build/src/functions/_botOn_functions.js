"use strict";
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
    bot.on('message:photo', _telefunctions_1.loadFunction, phtotListener);
    bot.on(':user_shared', _telefunctions_1.loadFunction, userSharedListener);
    bot.on(':chat_shared', _telefunctions_1.loadFunction, chatSharedListener);
    bot.on('message', _telefunctions_1.loadFunction, anyMsgListener);
};
exports.botOnHandler = botOnHandler;
const anyMsgListener = async (ctx) => {
    switch (ctx.session.botOnType) {
        // /sendwish BotOn Functions
        //Refer to finalWish Method in sendWishCallback.ts
        //Used for receiving wish msg
        case 1: {
            await _index_2.sendWishBotOn.sendWish_Execution(ctx);
            break;
        }
        // /DbFunctions BotOn Functions
        //Used for receiving reminders for all users that did not send in reminders
        case 2: {
            await _index_1.reminder.reminderSendAllNotIn_Execution(ctx);
            break;
        }
        //Used for receiving reminders for specific reminder
        //Used for receiving reminders for all users that did not send in reminders
        case 3: {
            await _index_1.reminder.sendSpecificReminder_Execution(ctx);
            break;
        }
        //eventDB BotOn Functions
        // Add Event Date Message
        case 4: {
            await _index_1.eventDB.addEvent_ReceiveEventName(ctx);
            break;
        }
        //Add NotAllowedUser Meassage
        case 5: {
            await _index_1.eventDB.addEvent_ReceiveEventDate(ctx);
            break;
        }
        //Used for editing welfare events (Event Name)
        case 6: {
            await _index_1.eventDB.editEventName_Execution(ctx);
            break;
        }
        //Used for editing welfare events (Event Dtae)
        case 7: {
            await _index_1.eventDB.editEventDate_Execution(ctx);
            break;
        }
        // sendSF BotOn Functions
        // Used for sending sf msg to google sheets
        case 8: {
            await _index_2.sendsfBotOn.sendToSheet_SF(ctx);
            break;
        }
        // Used for sending reason msg to google sheets
        case 9: {
            await _index_2.sendsfBotOn.sendToSheet_Reason(ctx);
            break;
        }
        // sendClaim BotOn Functions
        case 10: {
            await _index_2.sendClaimBotOn.logClaimAmount(ctx);
            break;
        }
        case 11: {
            await _index_2.sendClaimBotOn.logClaimReason(ctx);
            break;
        }
        // Adminfinance BotOn Functions
        // Password
        case 12: {
            await _index_3.adminFinanceBotOn.adminFinanceMenu(ctx);
            break;
        }
        case 13: {
            await _index_3.adminFinanceBotOn.addOfferingLGDate(ctx);
            break;
        }
        case 14: {
            await _index_3.adminFinanceBotOn.addOfferingExecution(ctx);
            break;
        }
        case 15: {
            await _index_3.adminFinanceBotOn.deleteOfferingRecord(ctx);
            break;
        }
        case 16: {
            await _index_3.adminFinanceBotOn.completedClaimAmountNo(ctx);
            break;
        }
        case 17: {
            await _index_3.adminFinanceBotOn.passwordCheck(ctx);
            break;
        }
        case 18: {
            await _index_3.adminFinanceBotOn.cfmChangePassword(ctx);
            break;
        }
        // sendattendance BotOn Functions
        case 19: {
            await _index_2.sendAttendanceBotOn.WeAttendanceLogReason(ctx);
            break;
        }
        case 20: {
            await _index_2.sendAttendanceBotOn.lgAttendanceLogReason(ctx);
            break;
        }
        // /adminattendance
        case 21: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_LGEventWEDateMessage(ctx);
            break;
        }
        case 22: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateLGEventSheet(ctx);
            break;
        }
        //Add without LG
        case 23: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateNoLGEventSheet(ctx);
            break;
        }
        //reminders
        case 24: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_SpecialEventDateMessage(ctx);
            break;
        }
        case 25: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateSpecialEventSheet(ctx);
            break;
        }
        // /sendattendance Special Event Logging Reason
        case 28: {
            await _index_2.sendAttendanceBotOn.SpecialAttendanceLogReason(ctx);
            break;
        }
        case 29: {
            await _index_2.sendAttendanceBotOn.dinnerAttendanceReason(ctx);
            break;
        }
        // /adminsf BotOn Functions
        case 30: {
            await _index_3.adminSFBotOn.manualSFNo(ctx);
            break;
        }
        // /settings announcements
        // Used for sending out announcement msg
        case 31: {
            await _index_4.settingBotOn.settingsAnnouncements_Send(ctx);
            break;
        }
        // /settings new user
        // Used for adding new user
        // User Full Name
        case 32: {
            await _index_4.settingBotOn.addUser_FullName(ctx);
            break;
        }
        // Change Sheet
        case 33: {
            await _index_1.gSheetDB.changeSheetExecution(ctx);
            break;
        }
        default: {
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                await ctx.reply('Sorry I do not understand. Please try again!');
        }
    }
};
const userSharedListener = async (ctx) => {
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
                await ctx.reply('Sorry I do not understand. Please try again!');
    }
};
const chatSharedListener = async (ctx) => {
    var _a;
    const request_id = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat_shared.request_id;
    if (!request_id) {
        console.log('Error! No request_id found in chat_shared message');
        return await ctx.reply('Sorry I do not understand. Please try again!');
    }
    switch (request_id) {
        case 1:
            await _index_1.chat.changeChatExecution(ctx);
            break;
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID) {
                console.log('Error! LG chat not found');
                return await ctx.reply('Sorry I do not understand. Please try again!');
            }
    }
};
const phtotListener = async (ctx) => {
    switch (ctx.session.botOnPhoto) {
        case 1:
            await _index_2.sendClaimBotOn.submitClaim(ctx);
            break;
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                await ctx.reply('Sorry I do not understand. Please try again!');
    }
};
