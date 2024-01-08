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
exports.dinnerLogAttendance = exports.logReasonBotOnDinner = exports.logReasonBotOnSpecial = exports.logReasonBotOnLG = exports.logReasonBotOnWE = void 0;
//Session BotOnType Values
exports.logReasonBotOnWE = 19;
exports.logReasonBotOnLG = 20;
exports.logReasonBotOnSpecial = 28;
exports.logReasonBotOnDinner = 29;
//Log Attendance Function
const dinnerLogAttendance = (ctx, rowNo, eventName, dinnerAttendance, dinnerReason) => __awaiter(void 0, void 0, void 0, function* () {
    const sheet = ctx.session.gSheet;
    if (sheet) {
        yield sheet.loadCells();
        let dinnerA1 = ``;
        let dinnerReasonA1 = ``;
        if (eventName == 'Special Event') {
            dinnerA1 = `F${rowNo}`;
            dinnerReasonA1 = `G${rowNo}`;
        }
        else if (eventName == 'No LG' || eventName == 'LG') {
            dinnerA1 = `I${rowNo}`;
            dinnerReasonA1 = `J${rowNo}`;
        }
        const dinnerCell = yield sheet.getCellByA1(dinnerA1);
        const dinnerReasonCell = yield sheet.getCellByA1(dinnerReasonA1);
        dinnerCell.value = dinnerAttendance;
        dinnerReasonCell.value = dinnerReason;
        yield sheet.saveUpdatedCells();
    }
});
exports.dinnerLogAttendance = dinnerLogAttendance;
