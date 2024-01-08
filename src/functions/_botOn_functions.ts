import { Bot, Filter } from 'grammy';
import { BotContext } from '../app/_index';
import { eventDB, reminder } from '../database_mongoDB/functions/_index';
import { settingsAnnouncements_Send } from '../cmd/settings/_settingsCallbacks';
import {
  sendAttendanceBotOn,
  sendWishBotOn,
  sendsfBotOn,
} from '../cmd/send/_index';
import { adminAttendanceBotOn, adminSFBotOn } from '../cmd/admin/_index';

// BotOn Functions
// Case 1: /sendwish BotOn Functions
export const botOnHandler = (bot: Bot<BotContext>) => {
  bot.on('message', anyMsgListener);
};

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
      // await adminWelfareCallback.addWelfareEvent_2(ctx);
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
      // await adminWelfareCallback.editWelfareEventName_2(ctx);
      break;
    }
    //Used for editing welfare events (Event Dtae)
    case 7: {
      await eventDB.editEventDate_Execution(ctx);
      // adminWelfareCallback.editWelfareEventDate_2(ctx);
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

    // /adminsf BotOn Functions
    case 30: {
      await adminSFBotOn.manualSFNo(ctx);
      break;
    }

    // sendattendance BotOn Functions
    case 19: {
      await sendAttendanceBotOn.WeAttendanceLogReason(ctx);
      break;
    }
    case 20: {
      await sendAttendanceBotOn.lgAttendanceLogReason(ctx);
      break;
    }
    // /adminattendance
    case 21: {
      await adminAttendanceBotOn.addAttendanceSheet_LGEventWEDateMessage(ctx);
      break;
    }
    case 22: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateLGEventSheet(ctx);
      break;
    }
    //Add without LG
    case 23: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateNoLGEventSheet(ctx);
      break;
    }
    //reminders
    case 24: {
      await adminAttendanceBotOn.addAttendanceSheet_SpecialEventDateMessage(
        ctx
      );
      // await adminAttendanceCallbac k.sendNotInReminder_2(ctx);
      break;
    }
    case 25: {
      await adminAttendanceBotOn.addAttendanceSheet_CreateSpecialEventSheet(
        ctx
      );
      // await adminAttendanceCallback.sendSpecificReminder_3(ctx);
      break;
    }

    // /sendattendance Special Event Logging Reason
    case 28: {
      await sendAttendanceBotOn.SpecialAttendanceLogReason(ctx);
      break;
    }
    case 29: {
      await sendAttendanceBotOn.dinnerAttendanceReason(ctx);
      break;
    }
    // /settings announcements
    // Used for sending out announcement msg
    case 31: {
      await settingsAnnouncements_Send(ctx);
      break;
    }
  }
};
