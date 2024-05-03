import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { gsheet } from '../../../functions/_initialise';

/**
 * Log reason for not attending SF
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 8
 * @param ctx The message context.
 */
export const manualSFNo = async (ctx: Filter<BotContext, 'message'>) => {
  const reason = await ctx.message.text;
  if (reason == null) {
    manualSFNo(ctx);
  }
  if (reason) {
    const unshakeableSFSpreadsheet = gsheet('sf');
    const sheet = (await unshakeableSFSpreadsheet).sheetsByTitle[
      'Telegram Responses'
    ];
    const teleUserName = ctx.session.name || '';
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
    (await unshakeableSFSpreadsheet).resetLocalCache();

    await ctx.reply('Sent!');

    ctx.session = initial();
  }
};
