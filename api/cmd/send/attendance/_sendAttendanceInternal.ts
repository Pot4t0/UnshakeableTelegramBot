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
    if (eventName == 'Special Event') {
      dinnerA1 = `F${rowNo}`;
      dinnerReasonA1 = `G${rowNo}`;
    } else if (eventName == 'No LG' || eventName == 'LG') {
      dinnerA1 = `I${rowNo}`;
      dinnerReasonA1 = `J${rowNo}`;
    }
    const dinnerCell = await sheet.getCellByA1(dinnerA1);
    const dinnerReasonCell = await sheet.getCellByA1(dinnerReasonA1);
    dinnerCell.value = dinnerAttendance;
    dinnerReasonCell.value = dinnerReason;
    await sheet.saveUpdatedCells();
  }
};
