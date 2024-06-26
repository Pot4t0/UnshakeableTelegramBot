"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWish = void 0;
const _telefunctions_1 = require("../../../app/_telefunctions");
/**
 * /sendWish
 * - Sends a wish message when the send wish event button is clicked.
 * @param bot The Bot instance.
 */
const sendWish = (bot) => {
    bot.callbackQuery(/^sendWishEvent-/g, _telefunctions_1.loadFunction, sendWish_WishMessage);
};
exports.sendWish = sendWish;
/**
 * Sends a wish message when the send wish event button is clicked.
 * @param ctx The message context.
 * @throws Error if the user spams the button.
 */
const sendWish_WishMessage = async (ctx) => {
    const event = ctx.update.callback_query.data.substring('sendWishEvent-'.length);
    try {
        await (0, _telefunctions_1.removeInLineButton)(ctx);
    }
    catch (err) {
        await ctx.reply(`Error! Please do not spam the button!`);
        console.log(err);
    }
    ctx.session.eventName = event;
    ctx.session.botOnType = 1;
    await ctx.answerCallbackQuery({
        text: event,
    });
    await ctx.reply(`Enter Your Wish for ${event}: `, {
        reply_markup: {
            force_reply: true,
        },
    });
};
