import { Filter } from 'grammy';
import {
  adminAttendanceCallback,
  adminSFCallback,
  adminWelfareCallback,
  adminbdayCallback,
  sendAttendanceCallback,
  sendWishCallback,
  sendsfFunctions,
} from './_index';
import { BotContext } from '../app/_index';

export const botOnContext = async (ctx: Filter<BotContext, 'message'>) => {
  switch (ctx.session.botOnType) {
    // /sendwish BotOn Functions
    //Refer to finalWish Method in sendWishCallback.ts
    //Used for receiving wish msg
    case 1: {
      await sendWishCallback.FinalReply(ctx);
      break;
    }

    // /adminwelfare BotOn Functions
    //Used for receiving reminders for specific reminder
    case 2: {
      await adminWelfareCallback.sendSpecificReminder_4(ctx);
      break;
    }
    //Used for receiving reminders for all users that did not send in reminders
    case 3: {
      await adminWelfareCallback.sendNotInReminder_3(ctx);
      break;
    }
    //Used for adding welfare events (Event Name)
    case 4: {
      await adminWelfareCallback.addWelfareEvent_2(ctx);
      break;
    }
    //Used for adding welfare events (Event Date)
    case 5: {
      await adminWelfareCallback.addWelfareEvent_3(ctx);
      break;
    }
    //Used for editing welfare events (Event Name)
    case 6: {
      await adminWelfareCallback.editWelfareEventName_2(ctx);
      break;
    }
    //Used for editing welfare events (Event Dtae)
    case 7: {
      adminWelfareCallback.editWelfareEventDate_2(ctx);
      break;
    }

    // /sendSF BotOn Functions
    //Used for receiving sf msg
    case 8: {
      await sendsfFunctions.sendSfEvent_2_yes(ctx);
      break;
    }
    //Used for receiving reason msg
    case 9: {
      await sendsfFunctions.sendSfEvent_2_no(ctx);
      break;
    }

    // /adminbday BotOn Functions
    case 10: {
      await adminbdayCallback.sendNotInReminder_3(ctx);
      break;
    }
    case 11: {
      await adminWelfareCallback.sendSpecificReminder_4(ctx);
      break;
    }
    case 12: {
      await adminbdayCallback.addBdayEvent_2(ctx);
      break;
    }
    case 13: {
      await adminbdayCallback.addBdayEvent_3(ctx);
      break;
    }
    case 14: {
      await adminbdayCallback.editEventName_2(ctx);
      break;
    }
    case 15: {
      await adminbdayCallback.editEventDate_2(ctx);
      break;
    }

    // /adminsf BotOn Functions
    case 16: {
      await adminSFCallback.sendNotInReminder_2(ctx);
      break;
    }
    case 17: {
      await adminSFCallback.sendNotInReminder_3(ctx);
      break;
    }
    case 18: {
      await adminSFCallback.sendSpecificReminder_3(ctx);
      break;
    }

    // adminattendance BotOn Functions
    case 19: {
      await sendAttendanceCallback.noLG_no_2(ctx);
      break;
    }
    case 20: {
      await sendAttendanceCallback.withLG_noLG_2(ctx);
      break;
    }
    case 21: {
      await adminAttendanceCallback.addAttendanceSheet_Yes_2(ctx);
      break;
    }
    case 22: {
      await adminAttendanceCallback.addAttendanceSheet_Yes_3(ctx);
      break;
    }
    //Add without LG
    case 23: {
      await adminAttendanceCallback.addAttendanceSheet_No_2(ctx);
      break;
    }
    //reminders
    case 24: {
      await adminAttendanceCallback.sendNotInReminder_2(ctx);
      break;
    }
    case 25: {
      await adminAttendanceCallback.sendSpecificReminder_3(ctx);
    }
  }
};
