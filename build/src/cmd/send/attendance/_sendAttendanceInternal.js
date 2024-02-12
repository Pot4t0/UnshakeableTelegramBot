"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAttendanceMsg = exports.dinnerLogAttendance = exports.logReasonBotOnDinner = exports.logReasonBotOnSpecial = exports.logReasonBotOnLG = exports.logReasonBotOnWE = void 0;
//Session BotOnType Values
exports.logReasonBotOnWE = 19;
exports.logReasonBotOnLG = 20;
exports.logReasonBotOnSpecial = 28;
exports.logReasonBotOnDinner = 29;
//Log Attendance Function
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
const logAttendanceMsg = async (ctx, eventName) => {
    ctx.reply(`Attendance ${eventName} logged! Thanks for submitting!`);
};
exports.logAttendanceMsg = logAttendanceMsg;
