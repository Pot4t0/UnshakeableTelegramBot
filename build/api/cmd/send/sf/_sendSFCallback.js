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
exports.sendsf = void 0;
const _index_1 = require("../../../gsheets/_index");
//Send SF Callbacks
const sendsf = (bot) => __awaiter(void 0, void 0, void 0, function* () {
    bot.callbackQuery('AttendanceSF-yes', sendSF);
    bot.callbackQuery('AttendanceSF-no', sendReason);
});
exports.sendsf = sendsf;
// Send SF Callback
// For attendance = yes
const sendSF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \n\nPlease type down your sermon feedback:
  `, {
        reply_markup: { force_reply: true },
    });
    yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    ctx.session.gSheet = sheet;
    ctx.session.botOnType = 8;
});
// Send Reason Callback
// For attendance = no
const sendReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
	Reason for not attending service :(
	`, {
        reply_markup: { force_reply: true },
    });
    yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    ctx.session.gSheet = sheet;
    ctx.session.botOnType = 9;
});
