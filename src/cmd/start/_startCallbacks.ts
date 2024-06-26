import { Bot, CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { Database } from '../../database_mongoDB/_db-init';
import { Names } from '../../database_mongoDB/Entity/_tableEntity';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

/**
 * Sets up callback query handlers for the start command.
 * This function registers callback queries for the start command.
 * @param bot The Bot instance.
 * @returns The next middleware function or command function.
 */
export const start = (bot: Bot<BotContext>) => {
  bot.callbackQuery(/^nameStart-/g, loadFunction, startReply);
  bot.callbackQuery('confirm_YES', loadFunction, confirmReply_Yes);
  bot.callbackQuery('select_YES', loadFunction, confirmReply_Yes);
  bot.callbackQuery('confirm_NO', loadFunction, confirmReply_No);
  bot.callbackQuery('select_NO', loadFunction, selectreply_No);
};

/**
 * Handles the logic for starting the bot.
 * This function prompts the user to input their name.
 * @param ctx The callback query context.
 */
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
  const teleUser = await name.map((n) => n.teleUser);
  if (chatid.toString() == '' || teleUser.toString() == '') {
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

/**
 * Handles the logic for confirming the user's name.
 * This function prompts the user to confirm their name.
 * @param ctx The callback query context.
 */
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

/**
 * Handles the logic for selecting the user's name.
 * This function prompts the user to select another name.
 * @param ctx The callback query context.
 */
const confirmReply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply('Understood.\nPlease /start to try again');
};

/**
 * Handles the logic for selecting the user's name.
 * This function prompts the user to select another name.
 * @param ctx The callback query context.
 */
const selectreply_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  await ctx.reply(
    'Please contact your respective IT representative for technical support!'
  );
};
