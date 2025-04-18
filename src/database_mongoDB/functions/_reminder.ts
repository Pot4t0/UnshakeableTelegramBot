import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_context';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Database } from '../_db-init';
import {
  Events,
  Names,
  SF_mongo,
  Settings,
  Wishes,
} from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { dbMessaging } from './_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';
import { gsheet } from '../../gsheets/_index';

// Reminder System
// Database - contaims all chatid and telegramm username
// Telegram - send message to respective chatid
// Team - string of team name (Attendance, Welfare, Admin, Birthday)
// Used in _botOn_functions.ts in botOnFunction = 'reminder_send_all_not_in_execution'
// Used in _botOn_functions.ts in botOnFunction = 'reminder_specific_reminder_execution'

/**
 * Sends a reminder message to all users who have not sent in their attendance, welfare wish, sermon feedback, or birthday wish.
 * @param ctx Context object.
 * @param team The team name, which can be either 'Attendance', 'Welfare', 'Admin', or 'Birthday'.
 * @param gsheet The Google Sheets worksheet. (Optional)
 */
export const reminderMenu = async (
  ctx: BotContext,
  team: 'Attendance' | 'Welfare' | 'Admin' | 'Birthday'
) => {
  ctx.session.team = team;
  let teamMessage;
  const callbackData = `sendReminder-${team}`;
  switch (team) {
    case 'Attendance':
      teamMessage = 'attendance';
      ctx.session.text = 'sendattendance';
      break;
    case 'Welfare':
      teamMessage = 'welfare wish';
      ctx.session.text = 'sendwish';
      break;
    case 'Admin':
      teamMessage = 'sermon feedback';
      ctx.session.text = 'sendsf';
      break;
    case 'Birthday':
      teamMessage = 'birthday wish';
      ctx.session.text = 'sendwish';
      break;
    default:
      await ctx.reply('Error in Reminder System!');
      console.log(
        'Error in Reminder System! Check team name got put properly!'
      );
      teamMessage = null;
      break;
  }

  if (teamMessage) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: `Send to ALL members who yet to send their ${teamMessage}`,
          callback_data: callbackData,
        },
      ],
      [
        {
          text: 'Send to specific member',
          callback_data: 'sendSpecificReminder',
        },
      ],
    ]);

    await ctx.reply(
      `
			Choose option
			\n(Send all option will exclude the person its for)
  
			\nDO NOT ABUSE THE REMINDER SYSTEM.
			`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  }
};

/**
 * Craft a reminder message to all users who have not sent in their attendance, welfare wish, sermon feedback, or birthday wish.
 * @param ctx Context object.
 * @param gsheet The Google Sheets worksheet. (Optional)
 * @returns The reminder message sent to all users who have not sent it in.
 */
export const reminderSendAllNotIn_ReminderMessage = async (
  ctx: CallbackQueryContext<BotContext>,
  gsheet?: GoogleSpreadsheetWorksheet
) => {
  ctx.session.gSheet = gsheet;
  await ctx.reply(
    `Write down the reminder msg for people that have not sent it in
	\nSuggestion to put /${ctx.session.text} so that user can click on it`,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  ctx.session.botOnFunction = 'reminder_send_all_not_in_execution';
};

/**
 * Sends a reminder message to all users who have not sent in their attendance, welfare wish, sermon feedback, or birthday wish.
 * Used in _botOn_functions.ts in botOnFunction = 'reminder_send_all_not_in_execution'
 * @param ctx Context object.
 * @param gsheet The Google Sheets worksheet.
 */
export const reminderSendAllNotIn_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const reminderMsg = ctx.message.text;
  if (reminderMsg == null) {
    reminderSendAllNotIn_Execution(ctx);
  }
  const team = ctx.session.team;
  const prefix = `<b>${team}:</b>\n`;

  switch (team) {
    // Send reminder to all users who have not sent in their attendance
    case 'Attendance':
      const totalNames = await Database.getMongoRepository(Names).find({
        where: { teleUser: { $not: { $eq: '' } } },
      });
      const sheet = ctx.session.gSheet;
      if (sheet) {
        await sheet.loadCells();
        await Promise.all(
          totalNames.map(async (i) => {
            const checkCell = sheet.getCellByA1(`C${i.attendanceRow}`);
            if (checkCell.value == null) {
              await dbMessaging.sendMessageUser(
                i.teleUser,
                prefix + reminderMsg,
                ctx
              );
              console.log(prefix + reminderMsg + `(${i.teleUser})`);
            }
          })
        );

        sheet.resetLocalCache();
        await ctx.reply(`Reminder sent!`);
      } else {
        await ctx.reply(`Error in sending reminder!`);
      }
      break;
    // Send reminder to all users who have not sent in their welfare wish or birthday wish
    case 'Welfare':
    case 'Birthday':
      const wishEventName = ctx.session.name;
      const inWishes = await Database.getMongoRepository(Wishes).find({
        eventName: wishEventName,
      });
      const notAllowedName = await Database.getMongoRepository(Events).find({
        eventName: wishEventName,
      });
      console.log(wishEventName);
      const notAllowedUser = await Database.getMongoRepository(Names).find({
        nameText: notAllowedName[0].notAllowedUser,
      });

      const notInNames = await Database.getMongoRepository(Names).find({
        where: {
          teleUser: {
            $not: {
              $in: await inWishes
                .map((n) => n.teleUser)
                .concat(notAllowedUser.map((n) => n.teleUser)),
            },
          },
        },
      });
      const notInUsers = await notInNames
        .map((n) => n.teleUser)
        .filter((n) => n != '');

      await Promise.all(
        notInUsers.map(async (n) => {
          await dbMessaging.sendMessageUser(n, prefix + reminderMsg, ctx);
          console.log(prefix + reminderMsg + `(${n})`);
        })
      );

      await ctx.reply(`Reminder sent!`);
      break;

    // Send reminder to all users who have not sent in their sermon feedback
    case 'Admin':
      const now = new Date();
      const offSetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 4
      );
      console.log('Date: ' + offSetDate);
      const InSF = await Database.getMongoRepository(SF_mongo).find({
        where: {
          timestamp: { $gte: offSetDate },
        },
      });
      const excludeNamesArr = await Database.getMongoRepository(
        Settings
      ).findOneBy({ option: 'SF Exclude' });
      if (excludeNamesArr) {
        const excludeNames = excludeNamesArr.config;
        const sendUserArr = InSF.map((n) => `${n.teleUser}`).concat(
          excludeNames
        );
        const notInNamesAdmin = await Database.getMongoRepository(Names).find({
          where: {
            teleUser: {
              $not: { $in: sendUserArr },
            },
          },
        });
        const notInUsersAdmin = notInNamesAdmin
          .map((n) => `${n.teleUser}`)
          .filter((n) => n != '');

        await Promise.all(
          notInUsersAdmin.map(async (n) => {
            await dbMessaging.sendMessageUser(n, prefix + reminderMsg, ctx);
            console.log(prefix + reminderMsg + `(${n})`);
          })
        );
        await ctx.reply(`Reminder sent!`);
      } else {
        await ctx.reply(`Error in sending reminder!`);
        console.log('Error in sending reminder!');
      }
      break;
    default:
      await ctx.reply('Error in Reminder System!');
      console.log('Error in Reminder System! Check sessions got put properly!');
      break;
  }
  ctx.session = initial();
};

/**
 * Sends a reminder message to a specific user.
 * @param bot The bot object.
 */
export const specificReminder = async (bot: Bot<BotContext>) => {
  bot.callbackQuery(
    'sendSpecificReminder',
    loadFunction,
    sendSpecificReminder_ChooseMember
  );
  bot.callbackQuery(
    /^reminderSpecificNames-/,
    loadFunction,
    sendSpecificReminder_ReminderMsg
  );
};

/**
 * Choose specific user for reminder message
 * @param ctx Context object.
 */
const sendSpecificReminder_ChooseMember = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `reminderSpecificNames-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply('Choose member:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Craft a reminder message to a specific user.
 * @param ctx Context object.
 */
const sendSpecificReminder_ReminderMsg = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);

  const telegramUser = await ctx.update.callback_query.data.substring(
    'reminderSpecificNames-'.length
  );
  ctx.session.reminderUser = telegramUser;
  const cmdString = ctx.session.text;
  await ctx.reply(
    `Write down the reminder msg that you want to send to @${telegramUser}
		  \nSuggestion to put /${cmdString} so that user can click on it
		  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  ctx.session.botOnFunction = 'reminder_specific_reminder_execution';
};
/**
 * Sends a reminder message to a specific user.
 * Used in _botOn_functions.ts in botOnFunction = 'reminder_specific_reminder_execution'
 * @param ctx Context object.
 */
export const sendSpecificReminder_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const team = ctx.session.team;
  const teleUser = ctx.session.reminderUser;
  if (teleUser) {
    const prefix = `<b>${team} Team:</b>\n`;
    const reminder = await ctx.message.text;
    if (reminder == null) {
      sendSpecificReminder_Execution(ctx);
    }
    await dbMessaging.sendMessageUser(teleUser, prefix + reminder, ctx);
    console.log(prefix + reminder + `(${teleUser})`);
    await ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
  }
  ctx.session = initial();
};
