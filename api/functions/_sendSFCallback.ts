import { CallbackQueryContext, Filter } from 'grammy';
import { BotContext } from '../app/_index';
import { gsheet } from '../gsheets/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names } from '../database_mongoDB/Entity/_tableEntity';

export const sendSfEvent_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.attendance = await ctx.update.callback_query.data.substring(
    'AttendanceSF-'.length
  );
  await ctx.reply(
    `
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. :-)
  \n\nPlease type down your sermon feedback:
  `,
    {
      reply_markup: { force_reply: true },
    }
  );
  ctx.session.botOnType = 8;
};
export const sendSfEvent_1_no = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.attendance = await ctx.update.callback_query.data.substring(
    'AttendanceSF-'.length
  );
  await ctx.reply(
    `
	Reason for not attending service :(
	`,
    {
      reply_markup: { force_reply: true },
    }
  );
  ctx.session.botOnType = 9;
};
// botOntype = 9
export const sendSfEvent_2_no = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text || '';
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.message.from.username,
  });
  await sheet.addRow({
    timeStamp: new Date().toLocaleString('en-sg', {
      timeZone: 'Asia/Singapore',
    }),
    name: user[0].nameText,
    sermonFeedback: '',
    attendance: 'No',
    reason: reason,
  });

  const data_sheet = gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
  await data_sheet.loadCells();
  const sfCell = await data_sheet.getCellByA1(`C${user[0].sfrow}`);
  const attendanceCell = await data_sheet.getCellByA1(`D${user[0].sfrow}`);
  const reasonCell = await data_sheet.getCellByA1(`E${user[0].sfrow}`);
  const timeStampCell = await data_sheet.getCellByA1(`F${user[0].sfrow}`);
  sfCell.value = '';
  attendanceCell.value = 'No';
  reasonCell.value = reason;
  (timeStampCell.value = Date()), await data_sheet.saveUpdatedCells();

  await ctx.reply('Sent!');
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// botOntype = 8
export const sendSfEvent_2_yes = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = undefined;
  const sf = ctx.message.text || '';
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  const user = await Database.getMongoRepository(Names).find({
    teleUser: ctx.update.message.from.username,
  });
  await sheet.addRow({
    timeStamp: Date(),
    name: user[0].nameText,
    sermonFeedback: sf,
    attendance: 'Yes',
    reason: '',
  });
  const data_sheet = gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
  await data_sheet.loadCells();
  const sfCell = await data_sheet.getCellByA1(`C${user[0].sfrow}`);
  const attendanceCell = await data_sheet.getCellByA1(`D${user[0].sfrow}`);
  const reasonCell = await data_sheet.getCellByA1(`E${user[0].sfrow}`);
  const timeStampCell = await data_sheet.getCellByA1(`F${user[0].sfrow}`);
  sfCell.value = sf;
  attendanceCell.value = 'Yes';
  reasonCell.value = '';
  timeStampCell.value = Date();
  await data_sheet.saveUpdatedCells();
  await ctx.reply('Sent!');
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
