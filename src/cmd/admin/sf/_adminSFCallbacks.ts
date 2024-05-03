import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names, Settings } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { reminder, team } from '../../../database_mongoDB/functions/_index';
import { adminSFBotOn } from './_adminSFInternal';
import { removeInLineButton } from '../../../app/_telefunctions';
import { gsheet } from '../../../functions/_initialise';

/**
 * /adminsf
 * - Sets up callback query handlers for the SF command.
 * - This function registers callback queries for the SF command.
 * @param bot The Bot instance.
 */
export const adminSF = (bot: Bot<BotContext>) => {
  // SF Reminder
  bot.callbackQuery('manageSFReminder', reminderManagement);
  bot.callbackQuery('sendReminder-Admin', sendNotInReminder);

  bot.callbackQuery('manualSF', manualSF);
  bot.callbackQuery(/^manualSFName-/g, sendsf);
  bot.callbackQuery(/^manualSendSF-/g, manualSFYesNo);

  team.teamManagement(bot, 'Admin');

  bot.callbackQuery('excludeFromReminder', excludeFromReminderMenu);
  bot.callbackQuery('addExcludeUser', excludeFromReminder);
  bot.callbackQuery(/^excludeUser-/g, excludeFromReminderFunction);
  bot.callbackQuery('removeExcludeUser', removeExcludeFromReminder);
  bot.callbackQuery(/^rmExcludeUser-/g, removeExcludeFromReminderFunction);
};

/**
 * Sends a reminder management menu.
 * @param ctx The message context.
 */
const reminderManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  await reminder.reminderMenu(ctx, 'Admin');
};
/**
 * Sends a reminder for those that have not sent in their SF.
 * @param ctx The message context.
 */
const sendNotInReminder = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  await reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};

/**
 * Sends a manual SF menu. Used for manual SF submission.
 * @param ctx The message context.
 */
const manualSF = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `manualSFName-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply(
    'Welcome to Unshakeable Telegram Bot\nPlease select your name:',
    {
      reply_markup: inlineKeyboard,
    }
  );
};

/**
 * Sends a sermon feedback manually.
 * @param ctx The message context.
 */
const sendsf = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  ctx.session.name = await ctx.update.callback_query.data.substring(
    'manualSFName-'.length
  );
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'manualSendSF-yes',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'manualSendSF-no',
      },
    ],
  ]);
  await ctx.reply('Attendance', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Checks attendance of sermon
 * @param ctx The message context.
 */
const manualSFYesNo = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = await ctx.update.callback_query.data.substring(
    'manualSendSF-'.length
  );
  if (callback == 'yes') {
    const sfmsg = '';
    const unshakeableSFSpreadsheet = await gsheet('sf');
    const sheet = unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    const teleUserName = (await ctx.session.name) || '';
    const user = await Database.getMongoRepository(Names).find({
      teleUser: teleUserName,
    });
    await sheet.addRow({
      timeStamp: Date(),
      name: user[0].nameText,
      sermonFeedback: sfmsg,
      attendance: 'Yes',
      reason: '',
    });
    await ctx.reply('Sent!');
    unshakeableSFSpreadsheet.resetLocalCache();
    ctx.session = initial();
  } else if (callback == 'no') {
    await ctx.reply(
      `
    Reason
    `,
      {
        reply_markup: { force_reply: true },
      }
    );
    ctx.session.botOnType = adminSFBotOn.manualSFNoFunction;
  } else {
    await ctx.reply('ERROR! Pls try again.');
    ctx.session = await initial();
  }
};

/**
 * Choose user to exclude from SF reminder.
 * @param ctx The message context.
 */
const excludeFromReminder = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const name = await Database.getRepository(Names).find();
  const excludeNamesArr = await Database.getMongoRepository(Settings).findOneBy(
    { option: 'SF Exclude' }
  );
  if (!excludeNamesArr) {
    const newExcludeNames = new Settings();
    newExcludeNames.option = 'SF Exclude';
    newExcludeNames.config = [];
    await Database.getMongoRepository(Settings).save(newExcludeNames);
  } else {
    const excludeNames = excludeNamesArr.config;
    const listedName = name.map((n) => {
      if (!excludeNames.includes(n.teleUser)) {
        return [
          { text: n.nameText, callback_data: 'excludeUser-' + n.teleUser },
        ];
      } else {
        return [];
      }
    });
    if (listedName.length > 0) {
      const inlineKeyboard = new InlineKeyboard(listedName);
      await ctx.reply('Choose user to exclude for SF reminder:', {
        reply_markup: inlineKeyboard,
      });
    } else {
      await ctx.reply('All users are already excluded from SF reminder');
    }
  }
};

/**
 * Excludes User Menu.
 * - Adds or removes user from exclusion list.
 * @param ctx The message context.
 */
const excludeFromReminderMenu = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add User for Exclusion',
        callback_data: 'addExcludeUser',
      },
    ],
    [
      {
        text: 'Remove User from Exclusion',
        callback_data: 'removeExcludeUser',
      },
    ],
  ]);
  await ctx.reply('Exclude user from SF reminder?', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Excludes a user from the SF reminder.
 * @param ctx The message context.
 */
const excludeFromReminderFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const teleUserName = ctx.update.callback_query.data.substring(
    'excludeUser-'.length
  );

  const excludeNamesArr = await Database.getMongoRepository(Settings).findOneBy(
    { option: 'SF Exclude' }
  );
  if (excludeNamesArr) {
    await Database.getMongoRepository(Settings).updateOne(
      { option: 'SF Exclude' },
      { $set: { config: excludeNamesArr.config.concat(teleUserName) } }
    );
  } else {
    const newExcludeNames = new Settings();
    newExcludeNames.option = 'SF Exclude';
    newExcludeNames.config = [teleUserName];
    await Database.getMongoRepository(Settings).save(newExcludeNames);
  }
  await ctx.reply(`User ${teleUserName} excluded from SF reminder`);
};

/**
 * Choose user to remove from exclusion list.
 * @param ctx The message context.
 */
const removeExcludeFromReminder = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const excludeNamesArr = await Database.getMongoRepository(Settings).findOneBy(
    { option: 'SF Exclude' }
  );
  if (excludeNamesArr) {
    const excludeNames = excludeNamesArr.config;
    const inlineKeyboard = new InlineKeyboard(
      excludeNames.map((n) => [
        {
          text: n,
          callback_data: `rmExcludeUser-${n}`,
        },
      ])
    );
    await ctx.reply('Choose user to remove from exclusion:', {
      reply_markup: inlineKeyboard,
    });
  } else {
    await ctx.reply('No user is excluded from SF reminder');
  }
};

/**
 * Removes a user from the exclusion list.
 * @param ctx The message context.
 */
const removeExcludeFromReminderFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const teleUserName = ctx.update.callback_query.data.substring(
    'rmExcludeUser-'.length
  );

  const excludeNamesArr = await Database.getMongoRepository(Settings).findOneBy(
    { option: 'SF Exclude' }
  );
  if (excludeNamesArr) {
    await Database.getMongoRepository(Settings).updateOne(
      { option: 'SF Exclude' },
      {
        $set: {
          config: excludeNamesArr.config.filter((n) => n !== teleUserName),
        },
      }
    );
    await ctx.reply(`User ${teleUserName} removed from exclusion`);
  } else {
    await ctx.reply('No user is excluded from SF reminder');
  }
};
