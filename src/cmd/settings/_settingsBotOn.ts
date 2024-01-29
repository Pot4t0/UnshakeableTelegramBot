import { Filter } from 'grammy';
import { BotContext } from '../../app/_index';
import { Database } from '../../database_mongoDB/_db-init';
import { Names, Settings } from '../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { dbMessaging } from '../../database_mongoDB/functions/_index';
import { gsheet } from '../../gsheets/_index';
import { unshakeableAttendanceSpreadsheet } from '../../gsheets/_gsheet_init';

// Settings Announcements Output
// Used in _botOn_functions.ts
// Refer to case botOntype = 31
export const settingsAnnouncements_Send = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const announcement = '<b>Bot Announcement:</b>\n' + ctx.message.text;
  if (announcement == null || ctx.session.botOnType == null) {
    settingsAnnouncements_Send(ctx);
  } else {
    const allNames = Database.getMongoRepository(Names).find();
    const sendUsers = (await allNames)
      .map((n) => n.teleUser)
      .filter((n) => n != '');
    await Promise.all(
      sendUsers.map(async (n) => {
        const sentMsg = await dbMessaging.sendMessageUser(n, announcement, ctx);
        try {
          await ctx.api.pinChatMessage(sentMsg.chat.id, sentMsg.message_id);
        } catch (err) {
          console.log(err);
        }
        console.log(announcement + `(${n})`);
      })
    );

    await ctx.reply(`Announcement sent!`);

    ctx.session = initial();
  }
};

// Settings Add User
// Full Name of New User
// Used in _botOn_functions.ts
// Refer to user_shared case 1
export const addUser = async (ctx: Filter<BotContext, ':user_shared'>) => {
  const chatid = ctx.update.message?.user_shared.user_id;
  if (chatid) {
    await ctx.reply(
      `User ID: ${chatid}, Please write down the full name of user:`,
      { reply_markup: { force_reply: true } }
    );
  } else {
    await ctx.reply('Error! Please try again!');
  }
  ctx.session.chatId = chatid;
  ctx.session.botOnType = 32;
};

// Settings Add User
// Full Name of New User
// Used in _botOn_functions.ts
// Refer to case botOntype = 32
export const addUser_FullName = async (ctx: Filter<BotContext, 'message'>) => {
  const fullName = ctx.message.text;
  const chatId = ctx.session.chatId;
  if (fullName && chatId) {
    const currentNames = await Database.getMongoRepository(Names).find();
    let nameExist = false;
    currentNames.map(async (n) => {
      if (n.nameText == fullName || n.chat == chatId.toString()) {
        nameExist = true;
      }
    });

    if (!nameExist) {
      const allNames = await Database.getMongoRepository(Names).find();
      const attendanceRow = allNames.map((n) => n.attendanceRow);
      const highestAttendnaceRow = Math.max(...attendanceRow) + 1;
      await Database.getMongoRepository(Names).save({
        nameText: fullName,
        chat: chatId.toString(),
        role: [],
        teleUser: '',
        attendanceRow: highestAttendnaceRow,
      });

      await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
      const template =
        unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
      const special_template =
        unshakeableAttendanceSpreadsheet.sheetsByTitle[
          'Special Event Template'
        ];
      await template.loadCells();
      const numberCell = template.getCellByA1(`A${highestAttendnaceRow}`);
      const nameCell = template.getCellByA1(`B${highestAttendnaceRow}`);
      numberCell.value = highestAttendnaceRow - 3;
      nameCell.value = fullName;
      await template.saveUpdatedCells();

      await special_template.loadCells();
      const special_numberCell = special_template.getCellByA1(
        `A${highestAttendnaceRow}`
      );
      const special_nameCell = special_template.getCellByA1(
        `B${highestAttendnaceRow}`
      );
      special_numberCell.value = highestAttendnaceRow - 3;
      special_nameCell.value = fullName;
      await special_template.saveUpdatedCells();

      await ctx.reply(
        `${fullName} added! Please change sermon feedback Google sheet accoridngly!\n\nName: ${fullName}\nChat ID: ${chatId}\nAttendance Row: ${highestAttendnaceRow}\n`
      );
    } else {
      await ctx.reply('User already exists!');
    }
    gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    ctx.session = initial();
  } else {
    await ctx.reply('Error! Please try again!');
    ctx.session = initial();
  }
};

// Settings Change LG Chat
// Used in _botOn_functions.ts
// Refer to user_shared case 2
export const changeLGChat = async (ctx: Filter<BotContext, ':chat_shared'>) => {
  const chatid = ctx.update.message?.chat_shared.chat_id;
  if (chatid) {
    await Database.getMongoRepository(Settings).updateOne(
      { option: 'LG' },
      { $set: { config: [chatid.toString()] } }
    );
    await ctx.reply(
      `LG Chat changed to ${chatid} Remember to add bot to the chat!`
    );
  } else {
    await ctx.reply('Error! Please try again!');
  }
};
