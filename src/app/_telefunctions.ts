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

// Adds Loading Message to indicate bot is processing (for long running functions)
export const loadFunction = async (ctx: BotContext, next: NextFunction) => {
  const chatid = ctx.chat?.id;
  const isGrp = ctx.chat?.type !== 'private';
  if (isGrp) {
    return;
  }
  if (chatid) {
    try {
      const loading = await ctx.reply('Processing... Please wait...');
      await next();
      await ctx.api.deleteMessage(chatid, loading.message_id);
    } catch (err) {
      await ctx.reply('Error! Please try again!');
      console.log(err);
    }
  } else {
    await ctx.reply('Error! Please try again!');
  }
};

// Telegram Logging
// Logs all console messages to a chat
export const teleLog = async (
  message: string,
  teleUser: string,
  type: 'error' | 'runtime' | 'info' | 'warn'
) => {};
