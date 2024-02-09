import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { Events, Names, Wishes } from '../Entity/_tableEntity';
import { Database } from '../_db-init';
import { BotContext } from '../../app/_context';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

// Wish View System
// Wish Database - Contains all wishes
// Filtered through event name
// Events Databse - Contains all events
// Filtered events through team type (Welfare / Birthday)
// CallbackQuery: see{team}Wish-{eventName}

export const wishView = async (
  bot: Bot<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  let eventName: string;
  bot.callbackQuery(`${team}WishView`, loadFunction, (ctx) => {
    wishView_EventMenu(ctx, team);
  });
  bot.callbackQuery(/^seeWish-/g, loadFunction, async (ctx) => {
    eventName = ctx.update.callback_query.data.substring('seeWish-'.length);
    await wishView_SendWishes(ctx, eventName);
  });
};

const wishView_EventMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Welfare') {
    eventTeam = 'Welfare';
  } else {
    eventTeam = 'Bday';
  }
  await removeInLineButton(ctx);

  const eventObject = await Database.getMongoRepository(Events).find({
    eventTeam: `${eventTeam}`,
  });
  const wishNumber = await Database.getMongoRepository(Wishes);
  const totalNames = await Database.getMongoRepository(Names).count();
  const inlineKeyboard = new InlineKeyboard(
    await Promise.all(
      eventObject.map(async (e) => [
        {
          text: `${e.eventName}  ( ${
            (await wishNumber.find({ eventName: e.eventName })).length
          } / ${totalNames} )`,
          callback_data: `seeWish-${e.eventName}`,
        },
      ])
    )
  );
  await ctx.reply(
    `
      Select ${team} Event
      `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

const wishView_SendWishes = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await removeInLineButton(ctx);
  const wishArray = await Database.getMongoRepository(Wishes).find({
    eventName: eventName,
  });
  await Promise.all(
    wishArray.map(async (n) => {
      await ctx.reply(`@${n.teleUser}\nWish: \n${n.wishText}`);
    })
  );
  if (wishArray[0] == null) {
    await ctx.reply('No Wish Received 😢');
  }
};
