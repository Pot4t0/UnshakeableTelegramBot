import { Bot, CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { Database } from '../../database_mongoDB/_db-init';
import { Names } from '../../database_mongoDB/Entity/_tableEntity';
import { removeInLineButton } from '../../app/_telefunctions';

export const start = (bot: Bot<BotContext>) => {
  bot.callbackQuery(/^nameStart-/g, startReply);
  bot.callbackQuery('confirm_YES', confirmReply_Yes);
  bot.callbackQuery('select_YES', confirmReply_Yes);
  bot.callbackQuery('confirm_NO', confirmReply_No);
  bot.callbackQuery('select_NO', selectreply_No);
};

const startReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const nameStart = ctx.update.callback_query.data.substring(
    'nameStart-'.length
  );
  const name = await Database.getMongoRepository(Names).find({
    where: {
      nameText: { $eq: nameStart },
    },
  });
  await removeInLineButton(ctx);
  const inlineKeyboard_confirm = new InlineKeyboard([
    [{ text: 'Yes', callback_data: 'confirm_YES' }],
    [{ text: 'No', callback_data: 'confirm_NO' }],
  ]);
  const inlineKeyboard_select = new InlineKeyboard([
    [{ text: 'Yes', callback_data: 'select_YES' }],
    [{ text: 'No', callback_data: 'select_NO' }],
  ]);
  const chatid = await name.map((n) => n.chat);
  if (chatid.toString() == '') {
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

const confirmReply_Yes = async (ctx: CallbackQueryContext<BotContext>) => {
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
    .text('/sendattendance')
    .row()
    .text('/adminwelfare')
    .row()
    .text('/adminbday')
    .row()
    .text('/adminsf')
    .row()
    .text('/adminattendance')
    .row()
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

const confirmReply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply('Understood.\nPlease /start to try again');
};

const selectreply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply(
    'Please contact your respective IT representative for technical support!'
  );
};
