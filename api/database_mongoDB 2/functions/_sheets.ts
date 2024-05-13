import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';
import { Database } from '../_db-init';
import { Settings } from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';

/**
 * Sets up callback query handlers for choosing a sheet associated with a specific group.
 * This function registers callback queries for changing the sheet associated with either the Attendance, SF, or Finance group.
 * @param bot The Bot instance.
 */
export const chooseSheet = async (bot: Bot<BotContext>) => {
  bot.callbackQuery('manageGSheet', loadFunction, sheetMenu);
  bot.callbackQuery(/^changeSheet/g, loadFunction, changeSheet); //Settings Bot On
};

/**
 * Handles the logic for changing the sheet associated with a specific group.
 * This function displays a keyboard for selecting a sheet when a user clicks on a callback button.
 * @param ctx The callback query context.
 */
const sheetMenu = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const inlinekeyboard = new InlineKeyboard([
    [
      {
        text: 'Attendance Sheet',
        callback_data: 'changeSheetAttendance',
      },
    ],
    [
      {
        text: 'SF Sheet',
        callback_data: 'changeSheetSF',
      },
    ],
    [
      {
        text: 'Finance Sheet',
        callback_data: 'changeSheetFinance',
      },
    ],
  ]);
  await ctx.reply('Choose Sheet to change to:', {
    reply_markup: inlinekeyboard,
  });
};

/**
 * Handles the logic for changing the sheet associated with a specific group.
 * This function prompts the user to input the sheet ID for the selected sheet.
 * @param ctx The callback query context.
 */
const changeSheet = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const sheetType = ctx.update.callback_query.data.substring(
    'changeSheet'.length
  );
  ctx.session.text = sheetType;
  await ctx.reply(
    `Please input the Sheet ID for the ${sheetType} Sheet. DO remember to give the bot permisssions!`,
    {
      reply_markup: { force_reply: true },
    }
  );
  ctx.session.botOnType = 33;
};

/**
 * Executes the sheet change process after a sheet ID is selected.
 * This function updates the database with the new sheet ID and notifies the user about the change.
 * @param ctx The filter for message events.
 */
export const changeSheetExecution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const sheetid = ctx.message.text;
  const sheetType = ctx.session.text;
  if (sheetid && sheetType) {
    const sheetArr = await Database.getMongoRepository(Settings).findOneBy({
      option: 'gsheet',
    });
    if (!sheetArr) {
      await ctx.reply('ERROR! Did not initialise chat ids for lg');
    } else {
      const sheetIDArr = sheetArr.config;
      switch (sheetType) {
        case 'Attendance':
          sheetIDArr[0] = sheetid.toString();
          process.env.LG_CHATID = sheetid.toString();
          break;
        case 'SF':
          sheetIDArr[1] = sheetid.toString();
          process.env.LG_CHATID = sheetid.toString();
          break;
        case 'Finance':
          sheetIDArr[2] = sheetid.toString();
          process.env.LG_FINANCE_CLAIM = sheetid.toString();
          break;

        default:
          await ctx.reply('ERROR! No Sheet found!');
          return;
      }
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'gsheet' },
        { $set: { config: sheetIDArr } }
      );
    }
    await ctx.reply(
      `${sheetType} Sheet changed to ${sheetid} Remember to add bot to the sheet!`
    );
  } else {
    await ctx.reply('Error! Please try again!');
  }
  ctx.session = initial();
};
