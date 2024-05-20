import { Filter, InputFile } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import { DateTime } from 'luxon';
import { Claims, Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { Database } from '../../../database_mongoDB/_db-init';
import { randomUUID } from 'crypto';
import { gsheet } from '../../../functions/_initialise';
import { dbMessaging } from '../../../database_mongoDB/functions/_index';
import { gdrive } from '../../../gdrive/_index';

/**
 * Used for receiving claim amount
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 10 (logClaimAmountBotOn)
 * @param ctx The message context.
 */
export const logClaimAmount = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = undefined;
  const amount = ctx.message.text;
  if (amount == null) {
    logClaimAmount(ctx);
  } else {
    // Log Claim Amount
    ctx.session.amount = amount;
    ctx.session.botOnType = 11;
    await ctx.reply('Please input the description for the claim:');
  }
};

/**
 * Used for receiving claim reason
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 11
 * @param ctx The message context.
 */
export const logClaimReason = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = undefined;
  const reason = ctx.message.text;
  if (reason == null) {
    logClaimReason(ctx);
  } else {
    // Log Claim Reason
    ctx.session.text = reason;
    await ctx.reply(
      'Please send in the image of the receipt for the claim.\n\n<b>(PHOTOS ONLY NO NEED TEXT)</b>',
      { parse_mode: 'HTML' }
    );
    ctx.session.botOnPhoto = 1;
  }
};
//Used for submitting claim
//Refer to BotOnHandler in _botOn_functions.ts
//BotOnPhoto = 1
/**
 * Used for submitting claim
 * Used in _botOn_functions.ts
 * - Refer to case botOnPhoto = 1
 * @param ctx The message context with photo.
 */
export const submitClaim = async (ctx: Filter<BotContext, 'message:photo'>) => {
  ctx.session.botOnPhoto = undefined;
  const photo = await ctx.getFile();
  if (photo == null) {
    submitClaim(ctx);
  } else {
    // Log Claim Receipt
    const user = ctx.session.name;
    const amount = ctx.session.amount;
    const reason = ctx.session.text;
    const date = DateTime.now().setZone('Asia/Singapore');
    const folderID = process.env.FINANCE_FOLDER_ID;
    const status = 'Pending Approval 🟠';
    const formattedDate = `${date.day} ${date.monthShort} ${date.year}`;
    const claimMsg = `Claim submitted by\n${user}\n${formattedDate}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`;
    const financeSheet = await gsheet('finance');
    const claimsSheet = financeSheet.sheetsByTitle['Claims'];
    const financeTeam = await Database.getMongoRepository(Names).find({
      role: 'finance',
    });

    if (folderID && user && amount && reason) {
      const claimId = randomUUID();
      const claimDoc = new Claims();
      claimDoc.claimid = claimId;
      claimDoc.amount = parseInt(amount);
      claimDoc.name = user;
      claimDoc.status = status;
      claimDoc.description = reason;
      claimDoc.date = formattedDate;
      claimDoc.msg = claimMsg;

      const photoPath = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${photo.file_path}`;

      const gdriveFilePath = await gdrive.uploadFile(photoPath, reason);
      const photoFormula = `=IMAGE("${gdriveFilePath}")`;
      const newRow = await claimsSheet.addRow({
        'Claim ID': claimId,
        Date: formattedDate,
        Amount: amount,
        Description: reason,
        Status: status,
        Claimee: user,
      });
      newRow.set('Images', photoFormula);
      await newRow.save();
      const sendDB = await Database.getMongoRepository(Claims).save(claimDoc);
      if (sendDB && newRow) {
        await ctx.reply('Claim submitted! Thank you!');
        await Promise.all(
          financeTeam.map(async (i) => {
            await dbMessaging.sendMessageUser(
              i.teleUser,
              `${user} has submitted a claim.`,
              ctx
            );
          })
        );
      } else {
        await ctx.reply('Error! Please try again!');
      }
    } else {
      await ctx.reply('Error! Please try again!');
    }
    financeSheet.resetLocalCache();
    ctx.session = initial();
  }
};
