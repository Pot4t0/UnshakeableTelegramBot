import { Bot, CallbackQueryContext } from 'grammy';
import { BotContext } from '../../../app/_context';

export const sendWish = (bot: Bot<BotContext>) => {
  bot.callbackQuery(/^sendWishEvent-/g, sendWish_WishMessage);
};

const sendWish_WishMessage = async (ctx: CallbackQueryContext<BotContext>) => {
  const event = ctx.update.callback_query.data.substring(
    'sendWishEvent-'.length
  );
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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
