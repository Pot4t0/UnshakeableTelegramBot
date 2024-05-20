import { Bot, Filter } from 'grammy';
import { BotContext } from '../app/_index';
import {
  chat,
  eventDB,
  gSheetDB,
  reminder,
} from '../database_mongoDB/functions/_index';

import {
  sendAttendanceBotOn,
  sendClaimBotOn,
  sendWishBotOn,
  sendsfBotOn,
} from '../cmd/send/_index';
import {
  adminAttendanceBotOn,
  adminSFBotOn,
  adminFinanceBotOn,
} from '../cmd/admin/_index';
import { settingBotOn } from '../cmd/settings/_index';
import { loadFunction } from '../app/_telefunctions';

// BotOn Functions
// Case 1: /sendwish BotOn Functions
/**
 * Handler for bot.on events.
 * @param {Bot<BotContext>} bot The bot instance.
 */
export const botOnHandler = (bot: Bot<BotContext>) => {
  bot.on('message:photo', loadFunction, phtotListener);
  bot.on(':user_shared', loadFunction, userSharedListener);
  bot.on(':chat_shared', loadFunction, chatSharedListener);
  bot.on('message', loadFunction, anyMsgListener);
};

/**
 * Listener for any message received.
 * @param {Filter<BotContext, 'message'>} ctx The context of the message.
 */
const anyMsgListener = async (ctx: Filter<BotContext, 'message'>) => {
  switch (ctx.session.botOnType) {
    // /sendwish BotOn Functions
    //Refer to finalWish Method in sendWishCallback.ts
    //Used for receiving wish msg
    case 1: {
      await sendWishBotOn.sendWish_Execution(ctx);
      break;
    }
    // /DbFunctions BotOn Functions
    //Used for receiving reminders for all users that did not send in reminders
    case 2: {
      await reminder.reminderSendAllNotIn_Execution(ctx);
      break;
    }
    //Used for receiving reminders for specific reminder
    //Used for receiving reminders for all users that did not send in reminders
    case 3: {
      await reminder.sendSpecificReminder_Execution(ctx);
      break;
    }
    //eventDB BotOn Functions
    // Add Event Date Message
    case 4: {
      await eventDB.addEvent_ReceiveEventName(ctx);
      break;
    }
    //Add NotAllowedUser Meassage
    case 5: {
      await eventDB.addEvent_ReceiveEventDate(ctx);
      break;
    }
    //Used for editing welfare events (Event Name)
    case 6: {
      await eventDB.editEventName_Execution(ctx);
      break;
    }
    //Used for editing welfare events (Event Dtae)
    case 7: {
      await eventDB.editEventDate_Execution(ctx);
      break;
    }

    // sendSF BotOn Functions
    // Used for sending sf msg to google sheets
    case 8: {
      await sendsfBotOn.sendToSheet_SF(ctx);
      break;
    }
    // Used for sending reason msg to google sheets
    case 9: {
      await sendsfBotOn.sendToSheet_Reason(ctx);
      break;
    }

    // sendClaim BotOn Functions
    // Used for receiving claim amount
    case 10: {
      await sendClaimBotOn.logClaimAmount(ctx);
      break;
    }
    // Used for receiving claim reason
    case 11: {
      await sendClaimBotOn.logClaimReason(ctx);
      break;
    }
    // Adminfinance BotOn Functions
    // Used for accessing admin finance menu
    case 12: {
      await adminFinanceBotOn.adminFinanceMenu(ctx);
      break;
    }
    // Used for adding Funds date (LG)
    case 13: {
      await adminFinanceBotOn.addFundsLGDate(ctx);
      break;
    }
    // Used for adding Funds execution
    case 14: {
      await adminFinanceBotOn.addFundsExecution(ctx);
      break;
    }
    // Used for deleting Funds record
    case 15: {
      await adminFinanceBotOn.deleteFundsRecord(ctx);
      break;
    }
    // Used for completed claim amount
    case 16: {
      await adminFinanceBotOn.completedClaimAmountNo(ctx);
      break;
    }
    // Used for password check
    case 17: {
      await adminFinanceBotOn.passwordCheck(ctx);
      break;
    }
    // Used for changing password
    case 18: {
      await adminFinanceBotOn.cfmChangePassword(ctx);
      break;
    }

    // sendattendance BotOn Functions
    // Used for sending attendance log reason
    case 19: {
      await sendAttendanceBotOn.WeAttendanceLogReason(ctx);
      break;
    }
    // Used for sending attendance log reason
    case 20: {
      await sendAttendanceBotOn.lgAttendanceLogReason(ctx);
      break;
    }
    // /adminattendance
    // Used for adding attendance sheet (LG Event)
    // Add LG Event Worship Experience Date
    case 21: {
      await adminAttendanceBotOn.addAttendanceSheet_LGEventWEDateMessage(ctx);
      break;
    }
    // Used for adding attendance sheet (LG Event)
    // Create LG Event Sheet
    case 22: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateLGEventSheet(ctx);
      break;
    }
    // Create No LG Event Sheet
    case 23: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateNoLGEventSheet(ctx);
      break;
    }
    // Add Special Event Date Message
    case 24: {
      await adminAttendanceBotOn.addAttendanceSheet_SpecialEventDateMessage(
        ctx
      );
      break;
    }
    // Create Special Event Sheet
    case 25: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateSpecialEventSheet(
        ctx
      );
      break;
    }

    // /sendattendance Special Event Logging Reason
    // Used for sending special event log reason
    case 28: {
      await sendAttendanceBotOn.SpecialAttendanceLogReason(ctx);
      break;
    }
    // Used for sending dinner attendance log reason
    case 29: {
      await sendAttendanceBotOn.dinnerAttendanceReason(ctx);
      break;
    }
    // /adminsf BotOn Functions
    // Used for manual sf no
    case 30: {
      await adminSFBotOn.manualSFNo(ctx);
      break;
    }
    // /settings announcements
    // Used for sending out announcement msg
    case 31: {
      await settingBotOn.settingsAnnouncements_Send(ctx);
      break;
    }
    // /settings new user
    // Used for adding new user
    // User Full Name
    case 32: {
      await settingBotOn.addUser_FullName(ctx);
      break;
    }
    // Change Sheet
    case 33: {
      await gSheetDB.changeSheetExecution(ctx);
      break;
    }
    // /adminfinance
    // Used for Finance Folder ID
    case 34: {
      await adminFinanceBotOn.changeFolderID(ctx);
      break;
    }
    // Unrecognised msg handler
    default: {
      const chatid = ctx.chat.id.toString();
      if (chatid != process.env.LG_CHATID)
        await ctx.reply('Sorry I do not understand. Please try again!');
    }
  }
};

/**
 * Listener for user shared events.
 * @param {Filter<BotContext, ':user_shared'>} ctx The context of the user shared event.
 */
const userSharedListener = async (ctx: Filter<BotContext, ':user_shared'>) => {
  const request_id = ctx.update.message?.user_shared.request_id;
  switch (request_id) {
    // /settings new user
    // Used to add new user
    // User Selection
    case 1:
      settingBotOn.addUser(ctx);
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
const chatSharedListener = async (ctx: Filter<BotContext, ':chat_shared'>) => {
  const request_id = ctx.update.message?.chat_shared.request_id;
  if (!request_id) {
    console.log('Error! No request_id found in chat_shared message');
    return await ctx.reply('Sorry I do not understand. Please try again!');
  }
  switch (request_id) {
    // /settings
    // Used to change LG chat
    // Chat Selection
    case 1:
      await chat.changeChatExecution(ctx);
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
const phtotListener = async (ctx: Filter<BotContext, 'message:photo'>) => {
  switch (ctx.session.botOnPhoto) {
    // /sendclaim
    // Used for submitting claim (photo)
    case 1:
      await sendClaimBotOn.submitClaim(ctx);
      break;
    // Unrecognised photo message
    default:
      const chatid = ctx.chat.id.toString();
      if (chatid != process.env.LG_CHATID)
        await ctx.reply('Sorry I do not understand. Please try again!');
  }
};
