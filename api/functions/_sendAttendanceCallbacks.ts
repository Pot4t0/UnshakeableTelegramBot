import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { gsheet } from '../gsheets/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names } from '../database_mongoDB/Entity/_tableEntity';
import { unshakeableAttendanceSpreadsheet } from '../gsheets/_gsheet_init';
import { initial } from '../models/_SessionData';

export const sendAttendanceReply = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const callback = await ctx.update.callback_query.data.substring(
    'svcLGAttendance-'.length
  );
  const sheet = await unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  ctx.session.attendance = callback;
  await sheet.loadCells('C3');
  const lgCell = await sheet.getCellByA1('C3');
  if (lgCell.value == 'No LG') {
    const inlineKeyboard = [
      [
        {
          text: 'Yes',
          callback_data: 'yesWeAttendance',
        },
      ],
      [
        {
          text: 'No',
          callback_data: 'noWeAttendance',
        },
      ],
    ];

    await ctx.reply(
      `${callback}\nThere is no LG this week\nAre you coming for Worship Experience?`,
      {
        reply_markup: { inline_keyboard: inlineKeyboard },
      }
    );
  } else if (lgCell.value == 'LG') {
    const inlineKeyboard = [
      [
        {
          text: 'Yes',
          callback_data: 'yesLGAttendance',
        },
      ],
      [
        {
          text: 'No',
          callback_data: 'noLGAttendance',
        },
      ],
    ];
    await ctx.reply('Are you coming for LG?', {
      reply_markup: { inline_keyboard: inlineKeyboard },
    });
  } else {
    await ctx.reply(
      'There is a technical error please feedback to your repsective leaders'
    );
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const noLG_yes = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.callback_query.from.username,
  });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      ctx.session.attendance || ''
    ];
  await sheet.loadCells();
  const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
  const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
  const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  weCell.value = 'Y';
  reasonCell.value = '';
  lgCell.value = ctx.session.eventName;
  lgReasonCell.value = ctx.session.text;
  await sheet.saveUpdatedCells();
  await ctx.reply('Attendance logged! Thanks for submitting!');
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const noLG_no_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('AW 😭.\nWhats the reason?', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 19;
};
//botontype = 19;
export const noLG_no_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = await undefined;
  const reason = (await ctx.message.text) || '';
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.message.from.username,
  });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      ctx.session.attendance || ''
    ];
  await sheet.loadCells();
  const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
  const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
  const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  weCell.value = 'N';
  reasonCell.value = reason;
  lgCell.value = ctx.session.eventName;
  lgReasonCell.value = ctx.session.text;
  await sheet.saveUpdatedCells();
  await ctx.reply('Attendance logged! Thanks for submitting!');
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const withLG_yesLG = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = 'Y';
  const inlineKeyboard = [
    [
      {
        text: 'Yes',
        callback_data: 'yesWeAttendance',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noWeAttendance',
      },
    ],
  ];

  await ctx.reply('Nice!\nWill you be coming for Worship Experience?', {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
};

export const withLG_noLG_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('AW 😭.\nWhats the reason?', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 20;
};
//botontype = 20;
export const withLG_noLG_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.text = (await ctx.message.text) || '';
  ctx.session.eventName = 'N';
  const inlineKeyboard = [
    [
      {
        text: 'Yes',
        callback_data: 'yesWeAttendance',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noWeAttendance',
      },
    ],
  ];

  await ctx.reply(
    `${ctx.session.attendance}\nAre you coming for Worship Experience?`,
    {
      reply_markup: { inline_keyboard: inlineKeyboard },
    }
  );
};
