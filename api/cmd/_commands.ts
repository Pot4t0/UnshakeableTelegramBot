import {
  Bot,
  CommandContext,
  Filter,
  InlineKeyboard,
  matchFilter,
} from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import {
  Attendance_mongo,
  Events,
  Names,
} from '../database_mongoDB/Entity/_tableEntity';

import { dbSecurity } from '../database_mongoDB/functions/_index';
import { gsheet } from '../functions/_initialise';
import { adminFinanceBotOn } from './admin/_index';
import { Update } from 'grammy/types';

// /start, /help, /settings, /sendsf, /sendwish, /sendattendance, /adminwelfare, /adminbday, /adminsf, /adminattendance
// This file contains all the commands that the bot can call
// Refer to each respective callback function for more details on the command

//All the commands that the bot can call
export const commands = (bot: Bot<BotContext>) => {
  //Call /start command
  bot.command('start', dbSecurity.checkUserInDatabaseMiddleware, start);
  //Call /help command
  bot.command('help', dbSecurity.checkUserInDatabaseMiddleware, help);
  //Call /settings command
  bot.command('settings', dbSecurity.checkUserInDatabaseMiddleware, settings);
  //Call /sendsf command
  bot.command('sendsf', dbSecurity.checkUserInDatabaseMiddleware, sendsf);
  //Call /sendwish command
  bot.command('sendwish', dbSecurity.checkUserInDatabaseMiddleware, sendWish);
  //Call /sendclaim command
  bot.command('sendclaim', dbSecurity.checkUserInDatabaseMiddleware, sendClaim);
  //Call /sendattendance
  bot.command(
    'sendattendance',
    dbSecurity.checkUserInDatabaseMiddleware,
    sendattendance
  );
  //Call /adminWelfare command
  bot.command(
    'adminwelfare',
    dbSecurity.checkUserInDatabaseMiddleware,
    adminWelfare
  );
  //Call /adminbday
  bot.command('adminbday', dbSecurity.checkUserInDatabaseMiddleware, adminbday);
  //Call /adminsf
  bot.command('adminsf', dbSecurity.checkUserInDatabaseMiddleware, adminsf);
  //Call /adminattendance
  bot.command(
    'adminattendance',
    dbSecurity.checkUserInDatabaseMiddleware,
    adminattendance
  );
  //Call /adminfinance
  bot.command(
    'adminfinance',
    dbSecurity.checkUserInDatabaseMiddleware,
    adminfinance
  );
};

//Start command
const start = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `nameStart-${n.nameText}`,
      },
    ])
  );
  await ctx.reply(
    'Welcome to Unshakeable Telegram Bot 🤖\nPlease select your name:',
    {
      reply_markup: inlineKeyboard,
    }
  );
};

//Help command
const help = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  await ctx.reply(`
	Help List
  \nIf there is any issue within the Bot or any feedback pls pm @whysominh for technical help ☺️
  \n/help --> Help List
  \n/settings --> Settings list
  \n/sendsf --> Send sermon feedback for the week
	\n/sendwish -->  Send wishes to upcoming welfare events
  \n/sendattendance -->  Send whether coming to LG/WE
	\n/adminwelfare --> Management of admin for Welfare Team (only accessible to serving members)
  \n/adminbday --> Management of admin for Bday Events
  \n/adminsf --> Management of sermon feedback for Admin Team (only accessible to serving members)
  \n/adminattendance --> Management of attendance (only accessible to Admin Team)
	`);
};

//Settings command
const settings = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await dbSecurity.roleAccess(['SGL', 'LGL', 'it'], ctx);
  if (access) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: 'Bot Announcements',
          callback_data: 'settingsAnnouncements',
        },
      ],
      [
        {
          text: 'Create a New User',
          callback_data: 'settingsNewUser',
        },
      ],
      [
        {
          text: 'Delete Existing User',
          callback_data: 'settingsDeleteUser',
        },
      ],
      [
        {
          text: 'Change LG Telegram Group',
          callback_data: 'changeChatLG',
        },
      ],
      [
        {
          text: 'LG Leaders Management',
          callback_data: 'manageLeadersTeam',
        },
      ],
      [
        {
          text: 'Change Google Sheet',
          callback_data: 'manageGSheet',
        },
      ],
    ]);
    await ctx.reply('Settings \n Only LGL,SGL & IT personnel can access this', {
      reply_markup: inlineKeyboard,
    });
  } else {
    await ctx.reply('No Access to Bot Settings');
  }
};

//Send SF command
const sendsf = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes 🙂',
        callback_data: 'AttendanceSF-yes',
      },
    ],
    [
      {
        text: 'No 🙁',
        callback_data: 'AttendanceSF-no',
      },
    ],
  ]);
  await ctx.reply(
    `Hi there! We will be collecting sermon feedback every week!
  \nFor those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \nPlease fill up this by SUNDAY, 7 PM! 🤗
  \n\nDid you attend service/watched online?
  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

//Send Wish command
const sendWish = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.message?.from.username,
  });
  const event = await Database.getMongoRepository(Events).find({
    where: {
      notAllowedUser: { $not: { $in: user.map((n) => n.nameText) } },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((e) => [
      {
        text: e.eventName,
        callback_data: `sendWishEvent-${e.eventName}`,
      },
    ])
  );

  await ctx.reply('Choose upcoming Birthday / Welfare Event ', {
    reply_markup: inlineKeyboard,
  });
};

//Send Attendance command
const sendattendance = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const archivedSheets = Database.getMongoRepository(Attendance_mongo).find({
    name: 'Archive',
  });
  const unshakeableAttendanceSpreadsheet = await gsheet('attendance');
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const archivedSheetsArray = (await archivedSheets)
    .map((n) => n.archive)
    .flat();
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .filter((n) => n != special_template)
      .filter((n) => !archivedSheetsArray.includes(n.title))
      .map((n) => [
        { text: n.title, callback_data: `svcLGAttendance-${n.title}` },
      ])
  );
  await ctx.reply(
    `Hi there! We will be collecting attendance every week!
  \nSelect the respective worship experience.`,
    {
      reply_markup: inlineKeyboard,
    }
  );
  await unshakeableAttendanceSpreadsheet.resetLocalCache();
};

//Make Finanace Claim
const sendClaim = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Make a claim',
        callback_data: 'makeClaim',
      },
    ],
    [
      {
        text: 'View Your Claims',
        callback_data: 'viewClaim',
      },
    ],
  ]);
  await ctx.reply(
    `<b>Unshakeable Finance Claims</b>\n\n<b>REMINDER</b>\nMake sure you inform the finance person before making any claims.`,
    {
      reply_markup: inlineKeyboard,
      parse_mode: 'HTML',
    }
  );
};

//Admin Welfare command
const adminWelfare = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await dbSecurity.roleAccess(
    ['welfare', 'welfareIC', 'LGL', 'it', 'SGL'],
    ctx
  );

  if (access) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: 'Manage Welfare Events',
          callback_data: 'manageWelfareEvent',
        },
      ],
      [
        {
          text: 'Manage Welfare Team',
          callback_data: 'manageWelfareTeam',
        },
      ],
      [
        {
          text: 'View Wishes',
          callback_data: 'WelfareWishView',
        },
      ],
      [
        {
          text: 'Send Reminder',
          callback_data: 'manageWelfareReminder',
        },
      ],
    ]);

    await ctx.reply(
      `
	Welfare Team Admin Matters
	\nYou can view all wishes and send reminders for all welfare events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'AIYO! You are not serving in Welfare. Hence, you cant access this :('
    );
  }
};

//Admin Birthday command
const adminbday = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  // const access = await dbSecurity.roleAccess(
  //   ['bday', 'bdayIC', 'LGL', 'it'],
  //   ctx
  // );

  // if (access) {
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Manage Birthday Events',
        callback_data: 'manageBirthdayEvent',
      },
    ],
    [
      {
        text: 'Manage Birthday Team',
        callback_data: 'manageBirthdayTeam',
      },
    ],
    [
      {
        text: 'See Wishes',
        callback_data: 'BirthdayWishView',
      },
    ],
    [
      {
        text: 'Send Reminder',
        callback_data: 'manageBirthdayReminder',
      },
    ],
  ]);

  await ctx.reply(
    `
	Birthday Team Admin Matters

	\nYou can view all wishes and send reminders for all birthday events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`,
    {
      reply_markup: inlineKeyboard,
    }
  );
  // } else {
  //   await ctx.reply(
  //     'AIYO! You are not serving in Birthday. Hence, you cant access this :('
  //   );
  // }
};

//Admin Sermon Feedback command
const adminsf = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await dbSecurity.roleAccess(
    ['admin', 'adminIC', 'LGL', 'it', 'SGL'],
    ctx
  );

  if (access) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: 'Send Reminder',
          callback_data: 'manageSFReminder',
        },
      ],
      [
        {
          text: 'Manual Send SF',
          callback_data: 'manualSF',
        },
      ],
      [
        {
          text: 'Manage Admin Team',
          callback_data: 'manageAdminTeam',
        },
      ],
      [
        {
          text: 'Exclude From Reminder',
          callback_data: 'excludeFromReminder',
        },
      ],
    ]);

    await ctx.reply(
      `
	Admin Team Admin Matters

	\nYou can send reminders for sermon feedback
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'AIYO! You are not serving in Admin. Hence, you cant access this :('
    );
  }
};

//Admin Attendance command
const adminattendance = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await dbSecurity.roleAccess(
    ['SGL', 'LGL', 'it', 'admin', 'adminIC'],
    ctx
  );

  if (access) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: 'Add Attendance Google Sheet',
          callback_data: 'addAttendanceSheet',
        },
      ],
      [
        {
          text: 'Delete Attendance Google Sheet',
          callback_data: 'delAttendanceSheet',
        },
      ],
      [
        {
          text: 'Send Reminders',
          callback_data: 'manageAttendanceReminder',
        },
      ],
      [
        {
          text: 'Send to Chat',
          callback_data: 'chatAttendance',
        },
      ],
      [
        {
          text: 'Archive Attendance Sheet',
          callback_data: 'archiveAttendance',
        },
      ],
      [
        {
          text: 'Unarchive Attendance Sheet',
          callback_data: 'unarchiveAttendance',
        },
      ],
    ]);

    await ctx.reply(
      `
	Unshakeable Attendance Matters

	\nOnly accessible to LG/SGL leaders (Exception made for IT)
  \nDo not edit the google sheet as it might tamper with the TeleBot algorithm
	\n\nInstructions:
	\n1. Create a new google sheet every week to collect attendance
  \n2. Delete old google sheets to declutter the google sheet
  \n3. Use reminder system to chase those that did not submit
  \n4. Archive old attendance sheets
  \n5. Unarchive archived attendance
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'AIYO! You are our LGL/SGL. Hence, you cant access this :('
    );
  }
};

//Admin Finance command
const adminfinance = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await dbSecurity.roleAccess(
    ['SGL', 'finance', 'LGL', 'it'],
    ctx
  );
  if (access) {
    if (!ctx.session.financeAccess) {
      await ctx.reply('Please enter password:');
      ctx.session.botOnType = 12;
    } else {
      ctx.update.message.text = process.env.FINANCE_PASSWORD || '';
      adminFinanceBotOn.adminFinanceMenu(ctx);
    }
  } else {
    await ctx.reply('No Access to Finance');
  }
};
