import { Bot, CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';
import { Database } from '../../database_mongoDB/_db-init';
import { Names } from '../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { chat, gSheetDB, team } from '../../database_mongoDB/functions/_index';
import { gsheet } from '../../functions/_initialise';

// Settings Callbacks
// Any overall bot admin settings
export const settings = (bot: Bot<BotContext>) => {
  bot.callbackQuery(
    'settingsAnnouncements',
    loadFunction,
    settingsAnnouncements_Write
  ); //Settings Announcements Input
  bot.callbackQuery('settingsNewUser', loadFunction, newUserManagement); //Settings New User Management
  //Settings Remove User Management
  bot.callbackQuery('settingsDeleteUser', loadFunction, rmUserManagement);
  bot.callbackQuery(/^rmUser-/g, loadFunction, rmUser);
  bot.callbackQuery(/^cfmRmUser-/g, loadFunction, cfmRmUser);

  // bot.callbackQuery('settingsLGGroup', loadFunction, lgGroupManagement); //Settings Bot On
  //Settings Announcements Output is located in BotOnFunctions
  chat.chooseChat(bot, 'LG');

  //Settings Leaders Team Management
  team.teamManagement(bot, 'Leaders');

  //Settings Chanage Google Sheet
  gSheetDB.chooseSheet(bot);
};

// Settings Announcements Input
const settingsAnnouncements_Write = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);
  await ctx.reply(
    `Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  ctx.session.botOnType = 31;
};

// Settings New User Management
const newUserManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const button = new Keyboard().requestUser('Add User', 1).oneTime(true);

  await ctx.reply('Click button to go to contact list', {
    reply_markup: button,
  });
};

// Settings Remove User Management
const rmUserManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const allNames = await Database.getMongoRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    allNames.map((n) => [
      {
        text: n.nameText,
        callback_data: `rmUser-${n.nameText}`,
      },
    ])
  );
  await ctx.reply('Click user to remove', {
    reply_markup: inlineKeyboard,
  });
};

const rmUser = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const user = await ctx.update.callback_query.data.substring('rmUser-'.length);
  ctx.session.name = user;
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: `cfmRmUser-Yes`,
      },
      {
        text: 'No',
        callback_data: `cfmRmUser-No`,
      },
    ],
  ]);
  await ctx.reply(`Are you sure you want to remove ${user}?`, {
    reply_markup: inlineKeyboard,
  });
};

const cfmRmUser = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const cfm = await ctx.update.callback_query.data.substring(
    'cfmRmUser-'.length
  );
  const user = ctx.session.name;
  if (user) {
    if (cfm == 'Yes') {
      const unshakeableAttendanceSpreadsheet = await gsheet('attendance');
      const template =
        unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
      const special_template =
        unshakeableAttendanceSpreadsheet.sheetsByTitle[
          'Special Event Template'
        ];
      const userDoc = await Database.getMongoRepository(Names).findOneBy({
        nameText: user,
      });
      if (userDoc) {
        const userRow = userDoc.attendanceRow;
        await template.loadCells();
        const numberCell = template.getCellByA1(`A${userRow}`);
        const nameCell = template.getCellByA1(`B${userRow}`);
        numberCell.value = '';
        nameCell.value = '';
        await template.saveUpdatedCells();

        await special_template.loadCells();
        const special_numberCell = special_template.getCellByA1(`A${userRow}`);
        const special_nameCell = special_template.getCellByA1(`B${userRow}`);
        special_numberCell.value = '';
        special_nameCell.value = '';
        await special_template.saveUpdatedCells();

        await Database.getMongoRepository(Names).delete({ nameText: user });
        await ctx.reply(`${user} has been removed`);

        //Change the attendance row of all users below the deleted user
        const allUsers = await Database.getMongoRepository(Names).find();
        allUsers.map(async (n) => {
          if (n.attendanceRow > userRow) {
            const userRow = n.attendanceRow - 1;
            const name = n.nameText;
            await Database.getMongoRepository(Names).update(
              { nameText: name },
              { attendanceRow: userRow }
            );

            await template.loadCells();
            const numberCell = template.getCellByA1(`A${userRow}`);
            const nameCell = template.getCellByA1(`B${userRow}`);
            numberCell.value = userRow - 3;
            nameCell.value = name;
            await template.saveUpdatedCells();

            await special_template.loadCells();
            const special_numberCell = special_template.getCellByA1(
              `A${userRow}`
            );
            const special_nameCell = special_template.getCellByA1(
              `B${userRow}`
            );
            special_numberCell.value = userRow - 3;
            special_nameCell.value = name;
            await special_template.saveUpdatedCells();
          }
        });

        await ctx.reply(
          "All user's attendance row has been updated. Please check the Google Sheet!"
        );
        unshakeableAttendanceSpreadsheet.resetLocalCache();
        ctx.session = initial();
      } else {
        await ctx.reply(`Deletion failed! Could not get ${user}`);
      }
    } else {
      await ctx.reply(`Deletion Cancelled`);
    }
  }
};
