import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_context';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Database } from '../_db-init';
import { Events, Names, SF_mongo, Wishes } from '../Entity/_tableEntity';
import { gsheet } from '../../gsheets/_index';
import { initial } from '../../models/_SessionData';
import { dbMessaging } from './_index';

// Reminder System
// Database - contaims all chatid and telegramm username
// Telegram - send message to respective chatid
// Team - string of team name (Attendance, Welfare, Admin, Birthday)
// Used in _botOn_functions.ts in botOntype = 2 and 3

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
// Reminder System - Send to ALL not in users
// Write reminder msg for all not in users
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
  ctx.session.botOnType = 2;
};
// Send Reminder Message to ALL not in users
// Used in _botOn_functions.ts in botOntype = 2
export const reminderSendAllNotIn_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const reminderMsg = ctx.message.text;
  if (reminderMsg == null) {
    reminderSendAllNotIn_Execution(ctx);
  }
  const team = ctx.session.team;
  const prefix = `<b>${team} Team:</b>\n`;

  switch (team) {
    case 'Attendance':
      const totalNames = await Database.getMongoRepository(Names).find({
        where: { teleUser: { $not: { $eq: '' } } },
      });
      const sheet = ctx.session.gSheet;
      if (sheet) {
        await sheet.loadCells();
        await Promise.all(
          totalNames.map(async (i) => {
            const checkCell = await sheet.getCellByA1(`C${i.attendanceRow}`);
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
        gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        await ctx.reply(`Reminder sent!`);
      } else {
        await ctx.reply(`Error in sending reminder!`);
      }
      break;
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
      const notInNamesAdmin = await Database.getMongoRepository(Names).find({
        where: {
          teleUser: { $not: { $in: InSF.map((n) => `${n.teleUser}`) } },
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
      break;
    default:
      await ctx.reply('Error in Reminder System!');
      console.log('Error in Reminder System! Check sessions got put properly!');
      break;
  }
  ctx.session = await initial();
};

// Reminder System - Send to specific user
// Used in bot.ts
export const specificReminder = async (bot: Bot<BotContext>) => {
  bot.callbackQuery('sendSpecificReminder', sendSpecificReminder_ChooseMember);
  bot.callbackQuery(
    /^reminderSpecificNames-/,
    sendSpecificReminder_ReminderMsg
  );
};
// Choose specific user to send reminder
const sendSpecificReminder_ChooseMember = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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
// Write reminder msg for specific user
const sendSpecificReminder_ReminderMsg = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

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
  ctx.session.botOnType = 3;
};
// Send Reminder Message to specific user
// Used in _botOn_functions.ts in botOntype = 3
//Uses botOnType = 3 to work
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
  ctx.session = await initial();
};
