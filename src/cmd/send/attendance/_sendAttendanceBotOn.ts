import { BotContext } from '../../../app/_index';
import { gsheet } from '../../../gsheets/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { Filter } from 'grammy';
import { dinnerLogAttendance } from './_sendAttendanceInternal';

// WE Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 19
// Logs Reason Message to Google Sheets
export const WeAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const reason = await ctx.message.text;
  if (reason == null) {
    WeAttendanceLogReason(ctx);
  }
  await ctx.reply('Processing... Please wait...');
  try {
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
    await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = await sheet.getCellByA1(
        `C${user[0].attendanceRow}`
      );
      const reasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
      attendanceCell.value = 'N';
      reasonCell.value = reason;
      await sheet.saveUpdatedCells();

      const meal = ctx.session.eventMeal;
      if (meal) {
        const inlineKeyboard = [
          [
            {
              text: 'Yes',
              callback_data: 'dinnerAttendance-Y',
            },
          ],
          [
            {
              text: 'No',
              callback_data: 'dinnerAttendance-N',
            },
          ],
        ];
        await ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      } else {
        await ctx.reply('Error! Pls try again');
        ctx.session = await initial();
        await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
      }
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
    ctx.session = await initial();
    await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
  }
};

// LG Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 20
// Logs Reason Message to Google Sheets
export const lgAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const reason = await ctx.message.text;
  if (reason == null) {
    lgAttendanceLogReason(ctx);
  }
  await ctx.reply('Processing... Please wait...');
  try {
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
    await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = await sheet.getCellByA1(
        `F${user[0].attendanceRow}`
      );
      const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
      attendanceCell.value = 'N';
      reasonCell.value = reason;
      await sheet.saveUpdatedCells();
      await ctx.reply('Attendance logged! Thanks for submitting!');
    } else {
      await ctx.reply('Error! Pls try again');
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
  }
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// Special Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 28
// Logs Reason Message to Google Sheets
export const SpecialAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const reason = await ctx.message.text;
  await ctx.reply('Processing... Please wait...');
  try {
    if (reason == null) {
      SpecialAttendanceLogReason(ctx);
    }
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
    await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = await sheet.getCellByA1(
        `C${user[0].attendanceRow}`
      );
      const reasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
      attendanceCell.value = 'N';
      reasonCell.value = reason;
      await sheet.saveUpdatedCells();

      const meal = ctx.session.eventMeal;
      if (meal) {
        const inlineKeyboard = [
          [
            {
              text: 'Yes',
              callback_data: 'dinnerAttendance-Y',
            },
          ],
          [
            {
              text: 'No',
              callback_data: 'dinnerAttendance-N',
            },
          ],
        ];
        await ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      } else {
        await ctx.reply('Attendance logged! Thanks for submitting!');
        ctx.session = initial();
        gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
      }
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
  }
  ctx.session = initial();
  gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// Dinner Attendance Reason Function
// Used in _botOn_functions.ts in botOntype = 29
// Logs Reason Message to Google Sheets (Special/ No LG Event)
// Proceeds to move to LG Attendance Function (LG Event)
export const dinnerAttendanceReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const reason = await ctx.message.text;
  if (reason == null) {
    dinnerAttendanceReason(ctx);
  } else {
    await ctx.reply('Processing... Please wait...');
    try {
      const user = await Database.getMongoRepository(Names).find({
        teleUser: await ctx.update.message.from.username,
      });
      switch (ctx.session.eventName) {
        case 'Special Event':
          dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          await ctx.reply('Attendance logged! Thanks for submitting!');
          ctx.session = await initial();
          await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
          break;
        case 'No LG':
          dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          await ctx.reply('Attendance logged! Thanks for submitting!');
          ctx.session = await initial();
          await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
          break;
        case 'LG':
          dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          const sheet = ctx.session.gSheet;
          if (sheet) {
            const lgDateCell = await sheet.getCellByA1('F2');
            const inlineKeyboard = [
              [
                {
                  text: 'Yes',
                  callback_data: 'lgAttendance-Y',
                },
              ],
              [
                {
                  text: 'No',
                  callback_data: 'lgAttendance-N',
                },
              ],
            ];
            await ctx.reply(
              `Are you coming for LG? on the ${lgDateCell.value}`,
              {
                reply_markup: { inline_keyboard: inlineKeyboard },
              }
            );
          }
          break;
        default:
          await ctx.reply('Error! Pls try again');
          ctx.session = initial();
          gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
      }
    } catch (err) {
      await ctx.reply('Could not log reason! Please try again!');
      console.log(err);
      ctx.session = initial();
      gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
  }
};
