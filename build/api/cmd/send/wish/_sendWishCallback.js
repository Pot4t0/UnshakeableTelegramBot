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
exports.sendWish = void 0;
const _telefunctions_1 = require("../../../app/_telefunctions");
const sendWish = (bot) => {
    bot.callbackQuery(/^sendWishEvent-/g, _telefunctions_1.loadFunction, sendWish_WishMessage);
};
exports.sendWish = sendWish;
const sendWish_WishMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = ctx.update.callback_query.data.substring('sendWishEvent-'.length);
    try {
        yield (0, _telefunctions_1.removeInLineButton)(ctx);
    }
    catch (err) {
        yield ctx.reply(`Error! Please do not spam the button!`);
        console.log(err);
    }
    ctx.session.eventName = event;
    ctx.session.botOnType = 1;
    yield ctx.answerCallbackQuery({
        text: event,
    });
    yield ctx.reply(`Enter Your Wish for ${event}: `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
