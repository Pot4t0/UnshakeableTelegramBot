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
exports.teleLog = exports.loadFunction = exports.removeInLineButton = void 0;
const removeInLineButton = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
        yield ctx.deleteMessage();
    }
    catch (err) {
        yield ctx.reply(`Error! Please do not spam the button!`);
        console.log(err);
    }
});
exports.removeInLineButton = removeInLineButton;
// Adds Loading Message to indicate bot is processing (for long running functions)
const loadFunction = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatid = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
    if (chatid) {
        const loading = yield ctx.reply('Processing... Please wait...');
        yield next();
        yield ctx.api.deleteMessage(chatid, loading.message_id);
    }
    else {
        yield ctx.reply('Error! Please try again!');
    }
});
exports.loadFunction = loadFunction;
// Telegram Logging
// Logs all console messages to a chat
const teleLog = (message, teleUser, type) => __awaiter(void 0, void 0, void 0, function* () { });
exports.teleLog = teleLog;
