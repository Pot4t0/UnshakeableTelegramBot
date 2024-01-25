import { CallbackQueryContext } from 'grammy';
import { BotContext } from './_context';

export const removeInLineButton = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  try {
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  } catch (err) {
    await ctx.reply(`Error! Please do not spam the button!`);
    console.log(err);
  }
};
