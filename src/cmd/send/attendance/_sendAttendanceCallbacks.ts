import { Bot, CallbackQueryContext, Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import {
  dinnerLogAttendance,
  logAttendanceMsg,
} from './_sendAttendanceInternal';
import {
  logReasonBotOnDinner,
  logReasonBotOnLG,
  logReasonBotOnSpecial,
  logReasonBotOnWE,
} from './_sendAttendanceInternal';
import { loadFunction, removeInLineButton } from '../../../app/_telefunctions';
import { gsheet } from '../../../functions/_initialise';

/**
 * @Special For Special Event
 * - Take Event Attendance (Yes/No) -> Take Reason (If no) -> Take Meal Attendance (if Have) -> Take Reason (if no) -> Log Attendance
 * @WE For No LG Event (WE only)
 * - Take WE Attendance (Yes/No) -> Take Reason (If no) -> Take Dinner Attendance (if Have) -> Take Reason (if no) -> Log Attendance
 * @WELG For LG Event (With both WE and LG)
 * - Take WE Attendance (Yes/No) -> Take Reason (If no) -> Take Dinner Attendance (if Have) -> Take Reason (if no) -> Take LG Attendance (Yes/No) -> Take Reason (if no) -> Log Attendance
 * @param bot The Bot instance.
 */
export const sendAttendance = (bot: Bot<BotContext>) => {
  bot.callbackQuery(/^svcLGAttendance/g, loadFunction, attendanceEventDecision);
  bot.callbackQuery(/^WeAttendance/g, loadFunction, WeAttendance);
  bot.callbackQuery(/^lgAttendance/g, loadFunction, lgAttendance);
  // Special Event
  bot.callbackQuery(/^SpecialAttendance-/g, loadFunction, SpecialAttendance);
  // Dinner/Meal Function
  bot.callbackQuery(/^dinnerAttendance-/g, loadFunction, dinnerAttendance);
};

/**
 * Checks the attendance event and sends the appropriate message.
 * @param ctx The callback query context.
 */
const attendanceEventDecision = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);
  const unshakeableAttendanceSpreadsheet = gsheet('attendance');
  const callback = ctx.update.callback_query.data.substring(
    'svcLGAttendance-'.length
  );
  const sheet = (await unshakeableAttendanceSpreadsheet).sheetsByTitle[
    callback
  ];
  await sheet.loadCells();

  // Sesssion Data for Special Attendance
  // Google Sheet Event Object (ctx.session.gsheet)
  // Google Sheet Event Name (ctx.session.eventName)
  ctx.session.attendance = callback;
  ctx.session.gSheet = sheet;

  const eventCell = sheet.getCellByA1('C3');
  const eventDateCell = sheet.getCellByA1('C2');
  const lgCell = sheet.getCellByA1('F3');
  const checkSpecialCell = sheet.getCellByA1('B2');

  // Special Event
  // If Sheet contains "Special Event" at cell B2 then, it will send special event attendance message
  if (checkSpecialCell.value == 'Special Event') {
    ctx.session.eventName = 'Special Event';
    ctx.session.eventMeal = sheet.getCellByA1('F3').stringValue;
    console.log(ctx.session.eventMeal);
    const inlineKeyboard = [
      [
        {
          text: 'Yes',
          callback_data: 'SpecialAttendance-Y',
        },
      ],
      [
        {
          text: 'No',
          callback_data: 'SpecialAttendance-N',
        },
      ],
    ];
    await ctx.reply(
      `Hi we will be having ${eventCell.value} on ${eventDateCell.value}. Will you be attending?`,
      {
        reply_markup: { inline_keyboard: inlineKeyboard },
      }
    );
    console.log('Special Event');
  } else {
    // No LG Event
    // If Sheet contains "No LG" at cell C3 then, it will send no LG attendance message
    if (lgCell.value == 'No LG') {
      ctx.session.eventName = 'No LG';
      ctx.session.eventMeal = await sheet.getCellByA1('I3').stringValue;
      const inlineKeyboard = [
        [
          {
            text: 'Yes',
            callback_data: 'WeAttendance-Y',
          },
        ],
        [
          {
            text: 'No',
            callback_data: 'WeAttendance-N',
          },
        ],
      ];

      await ctx.reply(
        `There is no LG this week\nAre you coming for Worship Experience on ${eventDateCell.value}?`,
        {
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      );
      console.log('No LG');
      // LG Event
      // If Sheet contains "LG" at cell C3 then, it will send LG attendance message
    } else if (lgCell.value == 'LG') {
      ctx.session.eventName = 'LG';
      ctx.session.eventMeal = sheet.getCellByA1('I3').stringValue;

      const inlineKeyboard = [
        [
          {
            text: 'Yes',
            callback_data: 'WeAttendance-Y',
          },
        ],
        [
          {
            text: 'No',
            callback_data: 'WeAttendance-N',
          },
        ],
      ];
      await ctx.reply(
        `Are you coming for Worship Experience on ${eventDateCell.value}?`,
        {
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      );
      console.log('LG');

      // Error Event
      // If Sheet contains anything else at cell C3 then, it will send error message
    } else {
      await ctx.reply('Error! Pls try again');
      ctx.session = initial();
      console.log('Error Event');
    }
  }
};

/**
 * Logs attendance for special events.
 * @param ctx The callback query context.
 */
const SpecialAttendance = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'SpecialAttendance-'.length
  );
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.callback_query.from.username,
  });
  if (callback == 'Y') {
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const sheetName = sheet.getCellByA1('C3').value;
      const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
      const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
      reasonCell.value = '';
      attendanceCell.value = 'Y';
      await sheet.saveUpdatedCells();
      const meal = ctx.session.eventMeal;
      if (meal) {
        console.log('Special Event Meal');
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
        await logAttendanceMsg(ctx, `${sheetName}`);
        sheet.resetLocalCache();
        ctx.session = initial();
      }
    }
  } else if (callback == 'N') {
    // Not Coming for Special Event
    await ctx.reply('AW 😭.\nWhats the reason?', {
      reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = logReasonBotOnSpecial;
  } else {
    await ctx.reply('Error! Pls try again');
    ctx.session = initial();
  }
};

/**
 * Logs attendance for No LG events.
 * @param ctx The callback query context.
 */
const WeAttendance = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = await ctx.update.callback_query.data.substring(
    'WeAttendance-'.length
  );
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.callback_query.from.username,
  });
  if (callback == 'Y') {
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();
      const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
      const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
      reasonCell.value = '';
      attendanceCell.value = 'Y';
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
        await ctx.reply(`Nice! Are you coming for ${meal}?`, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      }
    }
  } else if (callback == 'N') {
    // Not Coming for WE
    await ctx.reply('AW 😭.\nWhats the reason?', {
      reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = logReasonBotOnWE;
  } else {
    await ctx.reply('Error! Pls try again');
    ctx.session = initial();
  }
};

/**
 * Logs attendance for LG events.
 * @param ctx The callback query context.
 */
const lgAttendance = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = await ctx.update.callback_query.data.substring(
    'lgAttendance-'.length
  );
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.callback_query.from.username,
  });
  if (callback == 'Y') {
    const sheet = ctx.session.gSheet;
    if (sheet) {
      await sheet.loadCells();

      const sheetName = `WE: ${sheet.getCellByA1('C2').value}`;
      const attendanceCell = sheet.getCellByA1(`F${user[0].attendanceRow}`);
      const reasonCell = sheet.getCellByA1(`G${user[0].attendanceRow}`);
      reasonCell.value = '';
      attendanceCell.value = 'Y';
      await sheet.saveUpdatedCells();
      await logAttendanceMsg(ctx, sheetName);
      sheet.resetLocalCache();
      ctx.session = initial();
    }
  } else if (callback == 'N') {
    // Not Coming for LG
    await ctx.reply('AW 😭.\nWhats the reason?', {
      reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = logReasonBotOnLG;
  } else {
    await ctx.reply('Error! Pls try again');
    ctx.session = initial();
  }
};

/**
 * Logs dinner attendance.
 * - Logs Dinner Attendance to Google Sheets (Special/ No LG Event)
 * - Proceeds to move to LG Attendance Function (LG Event)
 * @param ctx The callback query context.
 */
const dinnerAttendance = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = await ctx.update.callback_query.data.substring(
    'dinnerAttendance-'.length
  );
  if (callback == 'Y') {
    const user = await Database.getMongoRepository(Names).find({
      teleUser: ctx.update.callback_query.from.username,
    });
    switch (ctx.session.eventName) {
      case 'Special Event':
      case 'No LG':
        await dinnerLogAttendance(
          ctx,
          user[0].attendanceRow,
          ctx.session.eventName,
          'Y',
          ''
        );
        ctx.session = initial();
        break;
      case 'LG':
        await dinnerLogAttendance(
          ctx,
          user[0].attendanceRow,
          ctx.session.eventName,
          'Y',
          ''
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
          await ctx.reply(`Are you coming for LG? on the ${lgDateCell.value}`, {
            reply_markup: { inline_keyboard: inlineKeyboard },
          });
        } else {
          await ctx.reply('Error! Pls try again');
          ctx.session = initial();
        }
        break;
      default:
        await ctx.reply('Error! Pls try again');
        ctx.session = initial();
    }
  } else if (callback == 'N') {
    await ctx.reply('AW 😭.\nWhats the reason?', {
      reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = logReasonBotOnDinner;
  } else {
    await ctx.reply('Error! Pls try again');
  }
};
