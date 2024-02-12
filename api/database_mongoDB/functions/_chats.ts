import { Bot, CallbackQueryContext, Filter, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';
import { Database } from '../_db-init';
import { Settings } from '../Entity/_tableEntity';

export const chooseChat = async (
  bot: Bot<BotContext>,
  grp: 'LG' | 'Finance'
) => {
  bot.callbackQuery(`changeChat${grp}`, loadFunction, async (ctx) => {
    await changeChat(ctx, grp);
  }); //Settings Bot On
};

const changeChat = async (
  ctx: CallbackQueryContext<BotContext>,
  grp: 'LG' | 'Finance'
) => {
  await removeInLineButton(ctx);
  const button = new Keyboard()
    .requestChat(`Choose ${grp} Chat`, 1)
    .oneTime(true);
  ctx.session.text = grp;
  await ctx.reply(
    `Choose the updated ${grp} Chat. It will let the Bot enter the chat and send messages.
	  `,
    {
      reply_markup: button,
    }
  );
};
export const changeChatExecution = async (
  ctx: Filter<BotContext, ':chat_shared'>
) => {
  const chatid = ctx.update.message?.chat_shared.chat_id;
  const grp = ctx.session.text;
  if (chatid && grp) {
    const lgDetailsArr = await Database.getMongoRepository(Settings).findOneBy({
      option: 'LG',
    });
    if (!lgDetailsArr) {
      await ctx.reply('ERROR! Did not initialise chat ids for lg');
    } else {
      const lgDetails = lgDetailsArr.config;
      switch (grp) {
        case 'LG':
          lgDetails[0] = chatid.toString();
          process.env.LG_CHATID = chatid.toString();
          break;
        case 'Finance':
          lgDetails[1] = chatid.toString();
          process.env.LG_FINANCE_CLAIM = chatid.toString();
          break;
        default:
          await ctx.reply('ERROR! No grp found!');
          return;
      }
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'LG' },
        { $set: { config: lgDetails } }
      );
    }
    await ctx.reply(
      `LG Chat changed to ${chatid} Remember to add bot to the chat!`
    );
  } else {
    await ctx.reply('Error! Please try again!');
  }
};
