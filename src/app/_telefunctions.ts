import { CallbackQueryContext, NextFunction } from 'grammy';
import { BotContext } from './_context';

const log_channel = process.env.LOG_CHANNEL;
const timeout_ms = 3000;
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
    let loading: { message_id: number } | undefined;
    try {
      loading = await ctx.reply('Processing... Please wait...');
      await next();
      await ctx.api.deleteMessage(chatid, loading.message_id);
    } catch (err) {
      if (loading) {
        await ctx.api.deleteMessage(chatid, loading.message_id);
      } else {
        const spam_message = await ctx.reply(
          'Error! Please do not spam the button!'
        );

        setTimeout(async () => {
          try {
            await ctx.api.deleteMessage(chatid, spam_message.message_id);
          } catch (e) {
            console.error('Failed to delete error message:', e);
          }
        }, timeout_ms);
      }
      console.log(err);
    }
  } else {
    console.log('Error! No chat ID found!');
  }
};

// Telegram MarkdownV2
function escapeMarkdownV2(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\./g, '\\.') // your specific error
    .replace(/!/g, '\\!');
}

// Telegram Logging
// Logs all console messages to a chat
export const sendErrorMsg = async (
  message: string,
  ctx: BotContext,
  errorFn: string,
  type: 'error' | 'runtime' | 'info' | 'warn',
  sendToUser?: boolean
) => {
  try {
    const chatid = ctx.chat?.id;
    if (!chatid) {
      console.log('Error! No chat ID found!');
      return;
    }
    if (sendToUser) {
      const user_msg = await ctx.api.sendMessage(chatid, message);
      setTimeout(async () => {
        try {
          await ctx.api.deleteMessage(chatid, user_msg.message_id);
        } catch (e) {
          console.error('Failed to delete error message:', e);
        }
      }, timeout_ms);
    }

    if (log_channel) {
      console.log(`Logging to ${log_channel}`);
      const safeMessage = escapeMarkdownV2(message);
      let formatted_message = safeMessage;
      switch (type) {
        case 'error':
          formatted_message = `*_❗️❗️Error❗️❗️_*\n\n_*Error Function:*_ ${errorFn}\n\n_*Message:*_\n${safeMessage}, \n\n_*Chat ID:*_ ${chatid},\n_*User ID:*_ ${chatid},\n_*Username:*_ @${ctx.from?.username}`;
          break;
        case 'runtime':
          formatted_message = `_*Runtime Error⚙️❗️*_\n\n_*Error Function:*_ ${errorFn}\n\n_*Message:*_\n${safeMessage}, \n\n_*Chat ID:*_ ${chatid},\n_*User ID:*_ ${chatid},\n_*Username:*_ @${ctx.from?.username}`;
          break;
        case 'info':
          formatted_message = `_*ℹ️Info*_\n\n_*Error Function:*_ ${errorFn}\n\n_*Message:*_\n${safeMessage}, \n\n_*Chat ID:*_ ${chatid},\n_*User ID:*_ ${chatid},\n_*Username:*_ @${ctx.from?.username}`;
          break;
        case 'warn':
          formatted_message = `_*⚠️⚠️Warning⚠️⚠️*_\n\n_*Error Function:*_ ${errorFn}\n\n_*Message:*_\n${safeMessage}, \n\n_*Chat ID:*_ ${chatid},\n_*User ID:*_ ${chatid},\n_*Username:*_ @${ctx.from?.username}`;
          break;
        default:
          formatted_message = safeMessage;
          break;
      }

      const log_msg = await ctx.api.sendMessage(
        log_channel,
        formatted_message,
        {
          parse_mode: 'MarkdownV2',
        }
      );
    } else {
      console.log('Error! No log channel found!');
    }
  } catch (err) {
    console.log(err);
  }
};
