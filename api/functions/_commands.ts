import { CommandContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import {
  Attendance_mongo,
  Events,
  Names,
} from '../database_mongoDB/Entity/_tableEntity';
import { roleAccess } from './_db_functions';
import { unshakeableAttendanceSpreadsheet } from '../gsheets/_gsheet_init';
import { gsheet } from '../gsheets/_index';

/* / start command
 *  Purpose is to tag the username with the name list inside the "names" collection within UnshakeableDB
 */
export const start = async (ctx: CommandContext<BotContext>) => {
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
    'Welcome to Unshakeable Telegram Bot\nPlease select your name:',
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const help = async (ctx: CommandContext<BotContext>) => {
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
  \n/adminbday --> Management of admin for Bday Team (only accessible to serving members)
  \n/adminsf --> Management of sermon feedback for Admin Team (only accessible to serving members)
  \n/adminattendance --> Management of attendance
	`);
};
export const settings = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await roleAccess(['SGL', 'LGL', 'it'], ctx);
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
          text: 'Make New User',
          callback_data: 'settingsNewUser',
        },
      ],
      [
        {
          text: 'Delete Exitisng User',
          callback_data: 'settingsDeleteUser',
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

export const sendsf = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'AttendanceSF-yes',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'AttendanceSF-no',
      },
    ],
  ]);
  await ctx.reply(
    `Hi there! We will be collecting sermon feedback every week!
  \nFor those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. :-)
  \nPlease fill up this by SUNDAY, 7 PM!
  \n\nDid you attend service/watched online?
  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const sendWish = async (ctx: CommandContext<BotContext>) => {
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
        callback_data: `eventName-${e.eventName}`,
      },
    ])
  );

  await ctx.reply('Choose upcoming Event ', {
    reply_markup: inlineKeyboard,
  });
};
export const sendattendance = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const archivedSheets = Database.getMongoRepository(Attendance_mongo).find({
    name: 'Archive',
  });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
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
  \nWhich worship experience date is it?`,
    {
      reply_markup: inlineKeyboard,
    }
  );
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const adminWelfare = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await roleAccess(['welfare', 'welfareIC', 'LGL', 'it'], ctx);

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
          text: 'See Wishes',
          callback_data: 'seeWelfareWishes',
        },
      ],
      [
        {
          text: 'Send Reminder',
          callback_data: 'manageReminder',
        },
      ],
    ]);

    await ctx.reply(
      `
	Welfare Team Admin Matters

	\nAll members can view all wishes and send reminders in all welfare events
	\nPlease respect the privacy of LG members by only using the information when deemed necessary.
	\nPlease also do not abuse the reminder system and annoy your fellow lifegroup members
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'Sorry you are not a member of Welfare.\nTherefore, due to privacy reasons, we cannot grant you access.\nThank you for your understanding'
    );
  }
};

export const adminbday = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await roleAccess(['bday', 'bdayIC', 'LGL', 'it'], ctx);

  if (access) {
    const inlineKeyboard = new InlineKeyboard([
      [
        {
          text: 'Manage Birthday Events',
          callback_data: 'manageBdayEvent',
        },
      ],
      [
        {
          text: 'Manage Birthday Team',
          callback_data: 'manageBdayTeam',
        },
      ],
      [
        {
          text: 'See Wishes',
          callback_data: 'seeBdayWishes',
        },
      ],
      [
        {
          text: 'Send Reminder',
          callback_data: 'manageBdayReminder',
        },
      ],
    ]);

    await ctx.reply(
      `
	Birthday Team Admin Matters

	\nAll members can view all wishes and send reminders in all birthday events
	\nPlease respect the privacy of LG members by only using the information when deemed necessary.
	\nPlease also do not abuse the reminder system and annoy your fellow lifegroup members
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'Sorry you are not a member of Birthday.\nTherefore, due to privacy reasons, we cannot grant you access.\nThank you for your understanding'
    );
  }
};

export const adminsf = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await roleAccess(['admin', 'adminIC', 'LGL', 'it'], ctx);

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
    ]);

    await ctx.reply(
      `
	Admin Team Admin Matters

	\nAll members can send reminders for sermon feedback
	\nPlease respect the privacy of LG members by only using the information when deemed necessary.
	\nPlease also do not abuse the reminder system and annoy your fellow lifegroup members
	`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    await ctx.reply(
      'Sorry you are not a member of Admin.\nTherefore, due to privacy reasons, we cannot grant you access.\nThank you for your understanding'
    );
  }
};

export const adminattendance = async (ctx: CommandContext<BotContext>) => {
  if (ctx.update.message?.chat.type !== 'private') {
    return false;
  }
  const access = await roleAccess(['SGL', 'LGL', 'it'], ctx);

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
      'Sorry you are not a LGL/SGL.\nTherefore, due to privacy reasons, we cannot grant you access.\nThank you for your understanding'
    );
  }
};
