import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { removeInLineButton } from '../../../app/_telefunctions';
import { Database } from '../../../database_mongoDB/_db-init';
import { Claims, Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { logClaimAmountBotOn } from './_claimInternal';

export const sendClaim = (bot: Bot<BotContext>) => {
  // Send Claim Callbacks
  bot.callbackQuery('makeClaim', makeClaim);
  bot.callbackQuery(/^makeClaim-/, makeClaimYesNo);
  bot.callbackQuery(/^makeClaimName-/, makeClaimYes);

  bot.callbackQuery('viewClaim', viewClaim);
};

const makeClaim = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'makeClaim-yes',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'makeClaim-no',
      },
    ],
  ]);
  await ctx.reply(`Are you making a claim on behalf of someone else?`, {
    reply_markup: inlineKeyboard,
  });
};

const makeClaimYesNo = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const user = ctx.callbackQuery.from.username;
  const callback = ctx.update.callback_query.data.substring(
    'makeClaim-'.length
  );
  if (callback === 'yes') {
    const names = await Database.getRepository(Names).find();
    const inlineKeyboard = new InlineKeyboard(
      names.map((n) => [
        {
          text: n.nameText,
          callback_data: `makeClaimName-${n.teleUser}`,
        },
      ])
    );

    await ctx.reply(
      'Please input the name of the person you are making the claim for:',
      {
        reply_markup: inlineKeyboard,
      }
    );
  } else {
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
  }
};

const makeClaimYes = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'makeClaimName-'.length
  );
  const name = await Database.getRepository(Names).findOneBy({
    teleUser: callback,
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
        await ctx.api.forwardMessage(userChatid, financeChatid, n.claimid);
        console.log('Claim Message ID: ' + n.claimid);
      })
    );
  } else {
    await ctx.reply('Error in system please try again later.');
  }
};
