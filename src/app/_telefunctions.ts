import { CallbackQueryContext, NextFunction } from 'grammy';
import { BotContext } from './_context';

export const removeInLineButton = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  try {
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    await ctx.deleteMessage();
  } catch (err) {
    await ctx.reply(`Error! Please do not spam the button!`);
    console.log(err);
  }
};

//Adds Loading Message to indicate bot is processing (for long running functions)
export const loadFunction = async (ctx: BotContext, next: NextFunction) => {
  const chatid = ctx.chat?.id;
  if (chatid) {
    const loading = await ctx.reply('Processing... Please wait...');
    await next();
    await ctx.api.deleteMessage(chatid, loading.message_id);
  } else {
    await ctx.reply('Error! Please try again!');
  }
};
