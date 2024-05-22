import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { Filter } from 'grammy';
import { dinnerLogAttendance } from './_sendAttendanceInternal';

/**
 * Logs the reason for the WE attendance.
 *  * Used in _botOn_functions.ts
 * Refer to case botOntype = 19
 * @param ctx The message context.
 */
export const WeAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text;
  if (reason == null) {
    WeAttendanceLogReason(ctx);
  }
  try {
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
      const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
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
        await ctx.reply(`Are you coming for ${meal}?`, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      } else {
        await ctx.reply('Error! Pls try again');
        ctx.session = initial();
        sheet.resetLocalCache();
      }
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
    ctx.session = initial();
  }
};

/**
 * Logs the reason for the LG attendance.
 * Used in _botOn_functions.ts
 * Refer to case botOntype = 20
 * @param ctx The message context.
 * @throws Error if the reason could not be logged.
 */
export const lgAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text;
  if (reason == null) {
    lgAttendanceLogReason(ctx);
  }
  try {
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
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
      sheet.resetLocalCache();
      await ctx.reply('Attendance logged! Thanks for submitting!');
    } else {
      await ctx.reply('Error! Pls try again');
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
  }
  ctx.session = initial();
};

/**
 * Logs the reason for the special attendance.
 * Used in _botOn_functions.ts
 * Refer to case botOntype = 28
 * @param ctx The message context.
 * @throws Error if the reason could not be logged.
 */
export const SpecialAttendanceLogReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text;
  try {
    if (reason == null) {
      SpecialAttendanceLogReason(ctx);
    }
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.message.from.username,
    });
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
      const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
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
        await ctx.reply(`Are you coming for ${meal}?`, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      } else {
        await ctx.reply('Attendance logged! Thanks for submitting!');
        ctx.session = initial();
      }
    }
  } catch (err) {
    await ctx.reply('Could not log reason! Please try again!');
    console.log(err);
  }
  ctx.session = initial();
};
/**
 * Logs Reason Message to Google Sheets (Special/ No LG Event)
 * Used in _botOn_functions.ts
 * Refer to case botOntype = 29
 * @param ctx The message context.
 * @throws Error if the reason could not be logged.
 */
export const dinnerAttendanceReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text;
  if (reason == null) {
    dinnerAttendanceReason(ctx);
  } else {
    try {
      const user = await Database.getMongoRepository(Names).find({
        teleUser: ctx.update.message.from.username,
      });
      switch (ctx.session.eventName) {
        case 'Special Event':
          await dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          ctx.session = initial();
          break;
        case 'No LG':
          await dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          ctx.session = initial();
          break;
        case 'LG':
          await dinnerLogAttendance(
            ctx,
            user[0].attendanceRow,
            ctx.session.eventName,
            'N',
            reason
          );
          const sheet = ctx.session.gSheet;
          if (sheet) {
            const lgDateCell = sheet.getCellByA1('F2');
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
      }
    } catch (err) {
      await ctx.reply('Could not log reason! Please try again!');
      console.log(err);
      ctx.session = initial();
    }
  }
};
