import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import { DateTime } from 'luxon';
import { Claims } from '../../../database_mongoDB/Entity/_tableEntity';
import { Database } from '../../../database_mongoDB/_db-init';
import { randomUUID } from 'crypto';
import { gsheet } from '../../../functions/_initialise';

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
    const claimChatId = process.env.LG_FINANCE_CLAIM;
    const status = 'Pending Approval 🟠';
    const formattedDate = `${date.day} ${date.monthShort} ${date.year}`;
    const claimMsg = `Claim submitted by\n${user}\n${formattedDate}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`;
    const financeSheet = await gsheet('finance');
    const claimsSheet = financeSheet.sheetsByTitle['Claims'];

    if (claimChatId && user && amount && reason) {
      const claimId = randomUUID();
      const claimDoc = new Claims();
      claimDoc.claimid = claimId;
      claimDoc.amount = parseInt(amount);
      claimDoc.name = user;
      claimDoc.status = status;
      claimDoc.description = reason;
      claimDoc.date = formattedDate;
      claimDoc.msg = claimMsg;

      const newRow = await claimsSheet.addRow({
        'Claim ID': claimId,
        Date: formattedDate,
        Amount: amount,
        Description: reason,
        Status: status,
        Claimee: user,
      });
      const photoFormula = `=IMAGE("https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${photo.file_path}")`; // Telegram API to get photo
      newRow.set('Images', photoFormula);
      await newRow.save();
      const sendDB = await Database.getMongoRepository(Claims).save(claimDoc);
      if (sendDB && newRow) {
        await ctx.reply('Claim submitted! Thank you!');
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
