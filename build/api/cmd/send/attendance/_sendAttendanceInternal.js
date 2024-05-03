"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAttendanceMsg = exports.dinnerLogAttendance = exports.logReasonBotOnDinner = exports.logReasonBotOnSpecial = exports.logReasonBotOnLG = exports.logReasonBotOnWE = void 0;
//Session BotOnType Values
/**
 * Log WE Reason BotOnType Constant
 */
exports.logReasonBotOnWE = 19;
/**
 * Log LG Reason BotOnType Constant
 */
exports.logReasonBotOnLG = 20;
/**
 * Log Special Event Reason BotOnType Constant
 */
exports.logReasonBotOnSpecial = 28;
/**
 * Log Dinner Reason BotOnType Constant
 */
exports.logReasonBotOnDinner = 29;
/**
 * Log dinner attendance to Google Sheets.
 * - Special Event and No LG events are ends with a message to the user.
 * - LG events do not end with a message to the user and continue to the next step (LG attendance).
 * @param ctx The message context.
 * @param rowNo The row number of the user in the Google Sheet.
 * @param eventName The name of the event.
 * @param attendance The attendance status of the user.
 * @param reason The reason for the attendance status.
 * @throws Error if the attendance could not be logged.
 */
const dinnerLogAttendance = async (ctx, rowNo, eventName, dinnerAttendance, dinnerReason) => {
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
        }
        else if (eventName == 'No LG' || eventName == 'LG') {
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
            await (0, exports.logAttendanceMsg)(ctx, name);
        }
    }
};
exports.dinnerLogAttendance = dinnerLogAttendance;
/**
 * Logs the end dinner attendance msg to the user.
 * @param ctx The message context.
 * @param eventName The name of the event.
 */
const logAttendanceMsg = async (ctx, eventName) => {
    await ctx.reply(`Attendance ${eventName} logged! Thanks for submitting!`);
};
exports.logAttendanceMsg = logAttendanceMsg;
