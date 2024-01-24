import { Bot, CallbackQueryContext, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { removeInLineButton } from '../../app/_telefunctions';
import { Database } from '../../database_mongoDB/_db-init';
import { Names } from '../../database_mongoDB/Entity/_tableEntity';
import { gsheet } from '../../gsheets/_index';
import { unshakeableAttendanceSpreadsheet } from '../../gsheets/_gsheet_init';
import { initial } from '../../models/_SessionData';

// Settings Callbacks
// Any overall bot admin settings
export const settings = (bot: Bot<BotContext>) => {
  bot.callbackQuery('settingsAnnouncements', settingsAnnouncements_Write); //Settings Announcements Input
  bot.callbackQuery('settingsNewUser', newUserManagement); //Settings New User Management
  //Settings Remove User Management
  bot.callbackQuery('settingsDeleteUser', rmUserManagement);
  bot.callbackQuery(/^rmUser-/g, rmUser);
  bot.callbackQuery(/^cfmRmUser-/g, cfmRmUser);
  bot.callbackQuery('settingsLGGroup', lgGroupManagement); //Settings Bot On
  //Settings Announcements Output is located in BotOnFunctions
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
  await ctx.reply('Processing... Please wait...');
  if (user) {
    if (cfm == 'Yes') {
      await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
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
        gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        ctx.session = initial();
      } else {
        await ctx.reply(`Deletion failed! Could not get ${user}`);
      }
    } else {
      await ctx.reply(`Deletion Cancelled`);
    }
  }
};

// Settings LG Group Change Management
const lgGroupManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const button = new Keyboard().requestChat('Choose LG Chat', 1).oneTime(true);
  await ctx.reply(
    `Choose the updated LG Chat. It will let the Bot enter the chat and send messages.
    `,
    {
      reply_markup: button,
    }
  );
};
