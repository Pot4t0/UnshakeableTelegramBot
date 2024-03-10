"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendsf = void 0;
const _telefunctions_1 = require("../../../app/_telefunctions");
const _initialise_1 = require("../../../functions/_initialise");
//Send SF Callbacks
const sendsf = async (bot) => {
    bot.callbackQuery('AttendanceSF-yes', _telefunctions_1.loadFunction, sendSF);
    bot.callbackQuery('AttendanceSF-no', _telefunctions_1.loadFunction, sendReason);
};
exports.sendsf = sendsf;
// Send SF Callback
// For attendance = yes
const sendSF = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    ctx.session.attendance = await ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    await ctx.reply(`
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \n\nPlease type down your sermon feedback:
  `, {
        reply_markup: { force_reply: true },
    });
    const unshakeableSFSpreadsheet = await (0, _initialise_1.gsheet)('sf');
    const sheet = unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    ctx.session.gSheet = sheet;
    ctx.session.botOnType = 8;
};
// Send Reason Callback
// For attendance = no
const sendReason = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    ctx.session.attendance = await ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    await ctx.reply(`
	Reason for not attending service :(
	`, {
        reply_markup: { force_reply: true },
    });
    const unshakeableSFSpreadsheet = await (0, _initialise_1.gsheet)('sf');
    const sheet = unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    ctx.session.gSheet = sheet;
    ctx.session.botOnType = 9;
};
