"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teleLog = exports.loadFunction = exports.removeInLineButton = void 0;
const removeInLineButton = async (ctx) => {
    try {
        await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
        await ctx.deleteMessage();
    }
    catch (err) {
        await ctx.reply(`Error! Please do not spam the button!`);
        console.log(err);
    }
};
exports.removeInLineButton = removeInLineButton;
// Adds Loading Message to indicate bot is processing (for long running functions)
const loadFunction = async (ctx, next) => {
    var _a, _b, _c;
    const chatid = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
    const isBot = ((_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.type) === 'group' || ((_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.type) === 'supergroup';
    if (isBot) {
        return;
    }
    if (chatid) {
        const loading = await ctx.reply('Processing... Please wait...');
        await next();
        await ctx.api.deleteMessage(chatid, loading.message_id);
    }
    else {
        await ctx.reply('Error! Please try again!');
    }
};
exports.loadFunction = loadFunction;
// Telegram Logging
// Logs all console messages to a chat
const teleLog = async (message, teleUser, type) => { };
exports.teleLog = teleLog;
