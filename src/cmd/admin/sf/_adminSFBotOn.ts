import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { gsheet } from '../../../gsheets/_index';
export const manualSFNo = async (ctx: Filter<BotContext, 'message'>) => {
  const reason = await ctx.message.text;
  if (reason == null) {
    manualSFNo(ctx);
  }
  if (reason) {
    await gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet =
      gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    const teleUserName = (await ctx.session.name) || '';
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

    await ctx.reply('Sent!');

    ctx.session = await initial();

    await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
  }
};
