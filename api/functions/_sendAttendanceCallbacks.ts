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
  ctx.session.attendance = await callback;
  await sheet.loadCells();
  const lgCell = await sheet.getCellByA1('C3');
  const lgDateCell = await sheet.getCellByA1('C2');
  const weDateCell = await sheet.getCellByA1('F2');
  const checkSpecialCell = await sheet.getCellByA1('B2');

  if (checkSpecialCell.value == 'Special Event') {
    const inlineKeyboard = [
      [
        {
          text: 'Yes',
          callback_data: 'yesSpecialAttendance',
        },
      ],
      [
        {
          text: 'No',
          callback_data: 'noSpecialAttendance',
        },
      ],
    ];
    await ctx.reply(
      `Hi we will be having ${lgCell.value} on ${lgDateCell.value}. Will you be attending?`,
      {
        reply_markup: { inline_keyboard: inlineKeyboard },
      }
    );
  } else {
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
        `There is no LG this week\nAre you coming for Worship Experience on ${weDateCell.value}?`,
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
      await ctx.reply(`Are you coming for LG on ${lgDateCell.value}?`, {
        reply_markup: { inline_keyboard: inlineKeyboard },
      });
    } else {
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
      await ctx.reply(
        `Are you coming for ${lgCell.value} on ${lgDateCell.value}?`,
        {
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      );
    }
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const yesSpecialAttendance = async (
  ctx: CallbackQueryContext<BotContext>
) => {
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
  const attendanceCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  const reasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  reasonCell.value = '';
  attendanceCell.value = 'Y';
  await sheet.saveUpdatedCells();
  await ctx.reply('Attendance logged! Thanks for submitting!');
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const noSpecialAttendance_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('AW 😭.\nWhats the reason?', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 28;
};
//botontype = 28
export const noSpecialAttendance_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
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
  const attendanceCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  const reasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  attendanceCell.value = 'N';
  reasonCell.value = reason;
  await sheet.saveUpdatedCells();
  await ctx.reply('Attendance logged! Thanks for submitting!');
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
export const noLG_yes = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.weAttendance = await 'Y';
  ctx.session.weReason = await '';
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
  await ctx.reply('Nice!\nAre you coming for dinner?', {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
  //   const user = await Database.getMongoRepository(Names).find({
  //     teleUser: ctx.update.callback_query.from.username,
  //   });
  //   await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  //   const sheet =
  //     await unshakeableAttendanceSpreadsheet.sheetsByTitle[
  //       ctx.session.attendance || ''
  //     ];
  //   await sheet.loadCells();
  //   const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
  //   const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  //   const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
  //   const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  //   weCell.value = 'Y';
  //   reasonCell.value = '';
  //   lgCell.value = ctx.session.eventName;
  //   lgReasonCell.value = ctx.session.text;
  //   await sheet.saveUpdatedCells();
  //   await ctx.reply('Attendance logged! Thanks for submitting!');
  //   ctx.session = await initial();
  //   await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
  ctx.session.weReason = (await ctx.message.text) || '';
  ctx.session.weAttendance = await 'N';
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
  await ctx.reply('Are you coming for dinner?', {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
  // const user = await Database.getMongoRepository(Names).find({
  //   teleUser: ctx.update.message.from.username,
  // });
  // await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  // const sheet =
  //   await unshakeableAttendanceSpreadsheet.sheetsByTitle[
  //     ctx.session.attendance || ''
  //   ];
  // await sheet.loadCells();
  // const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
  // const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  // const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
  // const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  // weCell.value = 'N';
  // reasonCell.value = reason;
  // lgCell.value = ctx.session.eventName;
  // lgReasonCell.value = ctx.session.text;
  // await sheet.saveUpdatedCells();
  // await ctx.reply('Attendance logged! Thanks for submitting!');
  // ctx.session = await initial();
  // await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const withLG_yesLG = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = 'Y';
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const callback = ctx.session.attendance || '';
  const sheet = await unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  ctx.session.attendance = callback;
  await sheet.loadCells('F2');
  const weDate = await sheet.getCellByA1('F2');
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
    `Nice!\nWill you be coming for Worship Experience on ${weDate.value}?`,
    {
      reply_markup: { inline_keyboard: inlineKeyboard },
    }
  );
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
  ctx.session.text = await ctx.message.text;
  ctx.session.eventName = 'N';
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const callback = ctx.session.attendance || '';
  const sheet = await unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  ctx.session.attendance = callback;
  await sheet.loadCells('F2');
  const weDate = await sheet.getCellByA1('F2');
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

  await ctx.reply(`Are you coming for Worship Experience on ${weDate.value}?`, {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const dinnerAttendance = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'dinnerAttendance-'.length
  );
  if (callback == 'Y') {
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
    const dinnerCell = await sheet.getCellByA1(`I${user[0].attendanceRow}`);
    const dinnerReasonCell = await sheet.getCellByA1(
      `J${user[0].attendanceRow}`
    );
    weCell.value = ctx.session.weAttendance;
    reasonCell.value = ctx.session.weReason;
    lgCell.value = ctx.session.eventName;
    lgReasonCell.value = ctx.session.text;
    dinnerCell.value = 'Y';
    dinnerReasonCell.value = '';
    await sheet.saveUpdatedCells();
    await ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = await initial();
    await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
  } else if (callback == 'N') {
    await ctx.reply('AW 😭.\nWhats the reason?', {
      reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 29;
  } else {
    await ctx.reply('Error! Pls try again');
  }
};
//botontype = 29
export const dinnerAttendanceReason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const reason = (await ctx.message.text) || '';
  const user = await Database.getMongoRepository(Names).find({
    teleUser: await ctx.update.message.from.username,
  });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      (await ctx.session.attendance) || ''
    ];
  await sheet.loadCells();
  const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
  const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
  const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
  const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
  const dinnerCell = await sheet.getCellByA1(`I${user[0].attendanceRow}`);
  const dinnerReasonCell = await sheet.getCellByA1(`J${user[0].attendanceRow}`);
  weCell.value = ctx.session.weAttendance;
  reasonCell.value = ctx.session.weReason;
  lgCell.value = ctx.session.eventName;
  lgReasonCell.value = ctx.session.text;
  dinnerCell.value = 'N';
  dinnerReasonCell.value = reason;
  await sheet.saveUpdatedCells();
  await ctx.reply('Attendance logged! Thanks for submitting!');
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
