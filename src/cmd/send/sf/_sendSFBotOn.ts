import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names, SF_mongo } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';

/**
 * Sends the sermon feedback to the Google Sheet
 * Used in _botOn_functions.ts
 * - Refer to case botOnFunction = 'send_sf'
 * @param ctx The message context.
 * @throws Error if the sermon feedback could not be logged.
 */
export const sendToSheet_SF = async (ctx: Filter<BotContext, 'message'>) => {
  const sfmsg = await ctx.message.text;
  const teleUserName = await ctx.update.message.from.username;
  const sheet = ctx.session.gSheet;
  try {
    if (sfmsg == null) {
      await ctx.reply('Error! Please re-enter your SF.');
      await sendToSheet_SF(ctx);
    } else {
      if (sfmsg && teleUserName && sheet) {
        const user = await Database.getMongoRepository(Names).find({
          teleUser: teleUserName,
        });
        const newRow = await sheet.addRow({
          timeStamp: Date(),
          name: user[0].nameText,
          sermonFeedback: sfmsg,
          attendance: 'Yes',
          reason: '',
        });

        if (newRow) {
          const collection = await Database.getMongoRepository(
            SF_mongo
          ).findOneBy({
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
        } else {
          await ctx.reply('ERROR! Failed to log SF. Pls try again!');
          console.log('SendSF Failed');
        }
        sheet.resetLocalCache();
      } else {
        await ctx.reply('ERROR! Pls try again!');
        console.log('SendSF Failed');
      }
      ctx.session = initial();
    }
  } catch (err) {
    await ctx.reply('ERROR! Please try again!');
    console.log(err);
  }
  ctx.session = initial();
};

// Send to Google Sheets Reason
// Used in _botOn_functions.ts in botOnFunction = 'send_reason'
/**
 * Sends the reason to the Google Sheet
 * Used in _botOn_functions.ts
 * - Refer to case botOnFunction = 'send_reason'
 * @param ctx The message context.
 * @throws Error if the reason could not be logged.
 */
export const sendToSheet_Reason = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const teleUserName = await ctx.update.message.from.username;
  const reason = await ctx.message.text;
  const sheet = ctx.session.gSheet;
  try {
    if (reason == null) {
      await ctx.reply('Error! Please re-enter your reason.');
      await sendToSheet_SF(ctx);
    } else {
      if (reason && teleUserName && sheet) {
        const user = await Database.getMongoRepository(Names).find({
          teleUser: teleUserName,
        });
        const newRow = await sheet.addRow({
          timeStamp: Date(),
          name: user[0].nameText,
          sermonFeedback: '',
          attendance: 'No',
          reason: reason,
        });
        if (newRow) {
          const collection = await Database.getMongoRepository(
            SF_mongo
          ).findOneBy({
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
              {
                $set: {
                  attendance: ['N', reason],
                  sf: '',
                  timestamp: new Date(),
                },
              }
            );
          }
          await ctx.reply('Sent! Your reason has been recorded successfully.');
        } else {
          await ctx.reply('ERROR! Failed to log reason. Pls try again!');
          console.log('SendSF Reason Failed');
        }
        sheet.resetLocalCache();
      } else {
        await ctx.reply('ERROR! Please try again!');
        console.log('SendSF Reason Failed');
      }
      ctx.session = initial();
    }
  } catch (err) {
    await ctx.reply('ERROR! Please try again!');
    console.log(err);
  }
  ctx.session = initial();
};
