import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { removeInLineButton } from '../../../app/_telefunctions';
import { Database } from '../../../database_mongoDB/_db-init';
import { Claims, Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { logClaimAmountBotOn } from './_claimInternal';

export const sendClaim = (bot: Bot<BotContext>) => {
  // Send Claim Callbacks
  bot.callbackQuery('makeClaim', makeClaim);
  bot.callbackQuery('viewClaim', viewClaim);
};

const makeClaim = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);

  const user = ctx.callbackQuery.from.username;
  const name = await Database.getRepository(Names).findOneBy({
    teleUser: user,
  });
  if (!name) {
    await ctx.reply('Invalid Name');
    return;
  }
  ctx.session.name = name.nameText;
  await ctx.reply('Please input the amount you are claiming in (SGD$):', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = logClaimAmountBotOn;
};

const viewClaim = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const teleUser = ctx.callbackQuery.from.username;
  const financeChatid = process.env.LG_FINANCE_CLAIM;
  const userChatid = ctx.callbackQuery.from.id;
  const names = await Database.getRepository(Names).findOneBy({
    teleUser: teleUser,
  });
  if (!names) {
    await ctx.reply('Invalid Name');
    return;
  }
  const claims = await Database.getRepository(Claims).find({
    where: {
      name: names.nameText,
    },
  });
  if (claims.length === 0) {
    await ctx.reply('You have no claims');
    return;
  }
  if (financeChatid) {
    await Promise.all(
      claims.map(async (n) => {
        await ctx.reply(n.msg, { parse_mode: 'HTML' });
        console.log('Claim Message ID: ' + n.claimid);
      })
    );
  } else {
    await ctx.reply('Error in system please try again later.');
  }
};
