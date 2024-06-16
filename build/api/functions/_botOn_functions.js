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
/**
 * Handler for bot.on events.
 * @param {Bot<BotContext>} bot The bot instance.
 */
const botOnHandler = (bot) => {
    bot.on('message:photo', _telefunctions_1.loadFunction, phtotListener);
    bot.on(':user_shared', _telefunctions_1.loadFunction, userSharedListener);
    bot.on(':chat_shared', _telefunctions_1.loadFunction, chatSharedListener);
    bot.on('message', _telefunctions_1.loadFunction, anyMsgListener);
};
exports.botOnHandler = botOnHandler;
/**
 * Listener for any message received.
 * @param {Filter<BotContext, 'message'>} ctx The context of the message.
 */
const anyMsgListener = async (ctx) => {
    const msg = ctx.message.text;
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
        // Used for receiving claim amount
        case 10: {
            await _index_2.sendClaimBotOn.logClaimAmount(ctx);
            break;
        }
        // Used for receiving claim reason
        case 11: {
            await _index_2.sendClaimBotOn.logClaimReason(ctx);
            break;
        }
        // Adminfinance BotOn Functions
        // Used for accessing admin finance menu
        case 12: {
            await _index_3.adminFinanceBotOn.adminFinanceMenu(ctx);
            break;
        }
        // Used for adding Funds date (LG)
        case 13: {
            await _index_3.adminFinanceBotOn.addFundsLGDate(ctx);
            break;
        }
        // Used for adding Funds execution
        case 14: {
            await _index_3.adminFinanceBotOn.addFundsExecution(ctx);
            break;
        }
        // Used for deleting Funds record
        case 15: {
            await _index_3.adminFinanceBotOn.deleteFundsRecord(ctx);
            break;
        }
        // Used for completed claim amount
        case 16: {
            await _index_3.adminFinanceBotOn.completedClaimAmountNo(ctx);
            break;
        }
        // Used for password check
        case 17: {
            await _index_3.adminFinanceBotOn.passwordCheck(ctx);
            break;
        }
        // Used for changing password
        case 18: {
            await _index_3.adminFinanceBotOn.cfmChangePassword(ctx);
            break;
        }
        // sendattendance BotOn Functions
        // Used for sending attendance log reason
        case 19: {
            await _index_2.sendAttendanceBotOn.WeAttendanceLogReason(ctx);
            break;
        }
        // Used for sending attendance log reason
        case 20: {
            await _index_2.sendAttendanceBotOn.lgAttendanceLogReason(ctx);
            break;
        }
        // /adminattendance
        // Used for adding attendance sheet (LG Event)
        // Add LG Event Worship Experience Date
        case 21: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_LGEventWEDateMessage(ctx);
            break;
        }
        // Used for adding attendance sheet (LG Event)
        // Create LG Event Sheet
        case 22: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateLGEventSheet(ctx);
            break;
        }
        // Create No LG Event Sheet
        case 23: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateNoLGEventSheet(ctx);
            break;
        }
        // Add Special Event Date Message
        case 24: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_SpecialEventDateMessage(ctx);
            break;
        }
        // Create Special Event Sheet
        case 25: {
            await _index_3.adminAttendanceBotOn.addAttendanceSheet_CreateSpecialEventSheet(ctx);
            break;
        }
        // /sendattendance Special Event Logging Reason
        // Used for sending special event log reason
        case 28: {
            await _index_2.sendAttendanceBotOn.SpecialAttendanceLogReason(ctx);
            break;
        }
        // Used for sending dinner attendance log reason
        case 29: {
            await _index_2.sendAttendanceBotOn.dinnerAttendanceReason(ctx);
            break;
        }
        // /adminsf BotOn Functions
        // Used for manual sf no
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
        // /adminfinance
        // Used for Finance Folder ID
        case 34: {
            await _index_3.adminFinanceBotOn.changeFolderID(ctx);
            break;
        }
        // Unrecognised msg handler
        default: {
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                await ctx.reply('Sorry I do not understand. Please try again!');
            console.log(`Msg not recognised! ${msg} from ${chatid}`);
            throw new Error(`Msg not recognised! ${msg} from ${chatid}`);
        }
    }
};
/**
 * Listener for user shared events.
 * @param {Filter<BotContext, ':user_shared'>} ctx The context of the user shared event.
 */
const userSharedListener = async (ctx) => {
    var _a;
    const request_id = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.user_shared.request_id;
    switch (request_id) {
        // /settings new user
        // Used to add new user
        // User Selection
        case 1:
            _index_4.settingBotOn.addUser(ctx);
            break;
        // Unrecognised user shared event
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                await ctx.reply('Sorry I do not understand. Please try again!');
    }
};
/**
 * Listener for chat shared events.
 * @param {Filter<BotContext, ':chat_shared'>} ctx The context of the chat shared event.
 */
const chatSharedListener = async (ctx) => {
    var _a;
    const request_id = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat_shared.request_id;
    if (!request_id) {
        console.log('Error! No request_id found in chat_shared message');
        return await ctx.reply('Sorry I do not understand. Please try again!');
    }
    switch (request_id) {
        // /settings
        // Used to change LG chat
        // Chat Selection
        case 1:
            await _index_1.chat.changeChatExecution(ctx);
            break;
        // Unrecognised chat shared event
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID) {
                console.log('Error! LG chat not found');
                return await ctx.reply('Sorry I do not understand. Please try again!');
            }
    }
};
/**
 * Listener for photo messages.
 * @param {Filter<BotContext, 'message:photo'>} ctx The context of the photo message.
 */
const phtotListener = async (ctx) => {
    switch (ctx.session.botOnPhoto) {
        // /sendclaim
        // Used for submitting claim (photo)
        case 1:
            await _index_2.sendClaimBotOn.submitClaim(ctx);
            break;
        // Unrecognised photo message
        default:
            const chatid = ctx.chat.id.toString();
            if (chatid != process.env.LG_CHATID)
                await ctx.reply('Sorry I do not understand. Please try again!');
    }
};
