import { CallbackQueryContext, Filter } from 'grammy';
import { BotContext } from '../app/_index';
import { gsheet } from '../gsheets/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names, SF_mongo } from '../database_mongoDB/Entity/_tableEntity';

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
  const reason = (await ctx.message.text) || '';
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  const teleUserName = (await ctx.update.message.from.username) || '';
  const user = await Database.getMongoRepository(Names).find({
    teleUser: teleUserName,
  });
  await sheet.addRow({
    timeStamp: Date(),
    name: user[0].nameText,
    sermonFeedback: '',
    attendance: 'No',
    reason: reason,
  });
  const collection = await Database.getMongoRepository(SF_mongo).findOneBy({
    teleUser: teleUserName,
  });

  if (!collection) {
    const sf = new SF_mongo();
    sf.teleUser = teleUserName;
    sf.attendance = ['N', reason];
    sf.sf = '';
    sf.timestamp = new Date();
    await Database.getMongoRepository(SF_mongo).save(sf);
  } else {
    await Database.getMongoRepository(SF_mongo).updateOne(
      { teleUser: teleUserName },
      { $set: { attendance: ['N', reason], sf: '', timestamp: new Date() } }
    );
  }
  await ctx.reply('Sent! Your SF has been recorded successfully.');

  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// botOntype = 8
export const sendSfEvent_2_yes = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = undefined;
  const sfmsg = (await ctx.message.text) || '';
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet =
    gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
  const teleUserName = (await ctx.update.message.from.username) || '';
  const user = await Database.getMongoRepository(Names).find({
    teleUser: teleUserName,
  });
  await sheet.addRow({
    timeStamp: Date(),
    name: user[0].nameText,
    sermonFeedback: sfmsg,
    attendance: 'Yes',
    reason: '',
  });
  const collection = await Database.getMongoRepository(SF_mongo).findOneBy({
    teleUser: teleUserName,
  });

  if (!collection) {
    const sfevent = new SF_mongo();
    sfevent.teleUser = teleUserName;
    sfevent.attendance = ['Y'];
    sfevent.sf = sfmsg;
    sfevent.timestamp = new Date();
    await Database.getMongoRepository(SF_mongo).save(sfevent);
  } else {
    await Database.getMongoRepository(SF_mongo).updateOne(
      { teleUser: teleUserName },
      { $set: { attendance: ['Y'], sf: sfmsg, timestamp: new Date() } }
    );
  }
  await ctx.reply('Sent! Your SF has been recorded successfully.');
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
