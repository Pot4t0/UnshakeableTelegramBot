import { Bot, CallbackQueryContext } from 'grammy';
import { BotContext } from '../../../app/_index';
import { gsheet } from '../../../gsheets/_index';
import { loadFunction, removeInLineButton } from '../../../app/_telefunctions';

//Send SF Callbacks
export const sendsf = async (bot: Bot<BotContext>) => {
  bot.callbackQuery('AttendanceSF-yes', loadFunction, sendSF);
  bot.callbackQuery('AttendanceSF-no', loadFunction, sendReason);
};

// Send SF Callback
// For attendance = yes
const sendSF = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  ctx.session.attendance = await ctx.update.callback_query.data.substring(
    'AttendanceSF-'.length
  );
  await ctx.reply(
    `
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \n\nPlease type down your sermon feedback:
  `,
    {
      reply_markup: { force_reply: true },
    }
  );
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  ctx.session.gSheet = sheet;
  ctx.session.botOnType = 8;
};

// Send Reason Callback
// For attendance = no
const sendReason = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  ctx.session.attendance = await ctx.update.callback_query.data.substring(
    'AttendanceSF-'.length
  );
  await ctx.reply(
    `
	Reason for not attending service :(
	`,
    {
      reply_markup: { force_reply: true },
    }
  );
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  ctx.session.gSheet = sheet;
  ctx.session.botOnType = 9;
};
