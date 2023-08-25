import { CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names } from '../database_mongoDB/Entity/_tableEntity';

export const startReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const nameStart = ctx.update.callback_query.data.substring(
    'nameStart-'.length
  );
  const name = await Database.getMongoRepository(Names).find({
    where: {
      nameText: { $eq: nameStart },
    },
  });
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.answerCallbackQuery({ text: nameStart });
  const inlineKeyboard_confirm = new InlineKeyboard([
    [{ text: 'Yes', callback_data: 'confirm_YES' }],
    [{ text: 'No', callback_data: 'confirm_NO' }],
  ]);
  const inlineKeyboard_select = new InlineKeyboard([
    [{ text: 'Yes', callback_data: 'select_YES' }],
    [{ text: 'No', callback_data: 'select_NO' }],
  ]);
  const teleUser = await name.map((n) => n.teleUser);
  if (teleUser.toString() == '') {
    ctx.session.name = nameStart;
    await ctx.reply(`${nameStart} chosen.\nIs this your name?`, {
      reply_markup: inlineKeyboard_confirm,
    });
  } else {
    await ctx.reply(
      `${nameStart} already taken.\nDo you still want to override?`,
      {
        reply_markup: inlineKeyboard_select,
      }
    );
  }
};

export const confirmReply_Yes = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const keyboard = new Keyboard()
    .text('/help')
    .row()
    .text('/settings')
    .row()
    .text('/sendsf')
    .row()
    .text('/sendwish')
    .row()
    .text('/adminwelfare')
    .row()
    .text('/adminbday')
    .row()
    .text('/adminsf')
    .resized();
  const chatid = await ctx.chat?.id.toString();
  await Database.getMongoRepository(Names).updateOne(
    { nameText: ctx.session.name },
    {
      $set: {
        teleUser: ctx.update.callback_query.from.username,
        chat: chatid,
      },
    }
  );
  await ctx.reply(
    'Name Logged!\nYou can now use any of the following functions below!',
    { reply_markup: keyboard }
  );
};

export const confirmReply_No = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply('Understood.\nPlease /start to try again');
};

export const selectreply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply(
    'Please contact your respective IT representative for technical support!'
  );
};
