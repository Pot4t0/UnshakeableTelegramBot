import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import { DateTime } from 'luxon';
import { Claims } from '../../../database_mongoDB/Entity/_tableEntity';
import { Database } from '../../../database_mongoDB/_db-init';

// /sendclaim BotOn Functions
//Used for receiving claim amount
//Refer to logClaimAmount Method in _claimInternal.ts
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
//Used for receiving claim reason
//Refer to botOnHandler in _botOn_functions.ts
//BotOntype = 11
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
export const submitClaim = async (ctx: Filter<BotContext, 'message:photo'>) => {
  ctx.session.botOnPhoto = undefined;
  const photo = ctx.update.message.photo;
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
    if (claimChatId && user && amount && reason) {
      const claim = await ctx.api.sendPhoto(
        claimChatId,
        photo[photo.length - 1].file_id,
        {
          caption: claimMsg,
          parse_mode: 'HTML',
        }
      );
      if (claim) {
        const claimId = claim.message_id;
        const claimDoc = new Claims();
        claimDoc.claimid = claimId;
        claimDoc.amount = parseInt(amount);
        claimDoc.name = user;
        claimDoc.status = status;
        claimDoc.description = reason;
        claimDoc.date = formattedDate;
        const sendDB = await Database.getMongoRepository(Claims).save(claimDoc);
        if (sendDB) {
          await ctx.reply('Claim submitted! Thank you!');
        } else {
          await ctx.reply('Error! Please try again!');
          ctx.api.deleteMessage(claimChatId, claimId);
        }
      } else {
        await ctx.reply('Error! Please try again!');
      }
    } else {
      await ctx.reply('Error! Please try again!');
    }
    ctx.session = initial();
  }
};
