// Send Attendance Global Variables
import { CallbackQueryContext, Filter } from 'grammy';
import { BotContext } from '../../../app/_context';
//Session BotOnType Values
export const logReasonBotOnWE = 19;
export const logReasonBotOnLG = 20;
export const logReasonBotOnSpecial = 28;
export const logReasonBotOnDinner = 29;

//Log Attendance Function
export const dinnerLogAttendance = async (
  ctx: CallbackQueryContext<BotContext> | Filter<BotContext, 'message'>,
  rowNo: number,
  eventName: string,
  dinnerAttendance: string,
  dinnerReason: string
) => {
  const sheet = ctx.session.gSheet;
  if (sheet) {
    await sheet.loadCells();
    let dinnerA1 = ``;
    let dinnerReasonA1 = ``;
    let attendanceNameA1 = ``;
    let name = ``;
    if (eventName == 'Special Event') {
      dinnerA1 = `F${rowNo}`;
      dinnerReasonA1 = `G${rowNo}`;
      attendanceNameA1 = `C3`;
    } else if (eventName == 'No LG' || eventName == 'LG') {
      dinnerA1 = `I${rowNo}`;
      dinnerReasonA1 = `J${rowNo}`;
      attendanceNameA1 = `C2`;
      name = 'WE: ';
    }
    const dinnerCell = sheet.getCellByA1(dinnerA1);
    const dinnerReasonCell = sheet.getCellByA1(dinnerReasonA1);
    const attendanceNameCell = sheet.getCellByA1(attendanceNameA1);
    dinnerCell.value = dinnerAttendance;
    dinnerReasonCell.value = dinnerReason;
    name += attendanceNameCell.value;
    await sheet.saveUpdatedCells();
    if (eventName == 'Special Event' || eventName == 'No LG') {
      await logAttendanceMsg(ctx, name);
    }
  }
};

export const logAttendanceMsg = async (ctx: BotContext, eventName: string) => {
  ctx.reply(`Attendance ${eventName} logged! Thanks for submitting!`);
};
