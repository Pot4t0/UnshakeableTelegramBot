import { CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../app';
import { Database } from '../database_mongoDB/db-init';
import { Names } from '../database_mongoDB/Entity/tableEntity';

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
    await ctx.reply(`To double confirm, you are ${nameStart} correct?`, {
      reply_markup: inlineKeyboard_confirm,
    });
  } else {
    await ctx.reply(
      `Someone has already claimed to be ${nameStart}.\nAre you sure you are ${nameStart}?`,
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
    .text('/sendSF')
    .row()
    .text('/sendwish')
    .row()
    .text('/adminWelfare')
    .row()
    .text('/adminBday')
    .row()
    .text('/adminSF')
    .resized()
    .persistent();
  await Database.getMongoRepository(Names).updateOne(
    { nameText: ctx.session.name },
    { $set: { teleUser: ctx.update.callback_query.from.username } }
  );
  await ctx.reply(
    'Welcome!\nYou can now use the following functions!',
    { reply_markup: keyboard }
  );
};

export const confirmReply_No = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply('Understood.\nPlease enter /start to try again');
};

export const selectreply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply(
    'Please contact your respective IT representative for technical support!'
  );
};
