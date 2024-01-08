import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { Events, Names, Wishes } from '../Entity/_tableEntity';
import { Database } from '../_db-init';
import { BotContext } from '../../app/_context';

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
  bot.callbackQuery(`${team}WishView`, (ctx) => {
    wishView_EventMenu(ctx, team);
  });
  bot.callbackQuery(/^seeWish-/g, async (ctx) => {
    eventName = ctx.update.callback_query.data.substring('seeWish-'.length);
    await wishView_SendWishes(ctx, eventName);
  });
};

const wishView_EventMenu = async (
  ctx: BotContext,
  team: 'Welfare' | 'Birthday'
) => {
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Welfare') {
    eventTeam = 'Welfare';
  } else {
    eventTeam = 'Bday';
  }
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

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
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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
