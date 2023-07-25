import { CallbackQueryContext, Filter } from 'grammy';

import { BotContext } from '../app/context';
import { Database } from '../database_mongoDB/db-init';
import { initial } from '../models/SessionData';
import { Wishes } from '../database_mongoDB/Entity/tableEntity';

export const EventReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const event = ctx.update.callback_query.data.substring('eventName-'.length);
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = event;
  await ctx.answerCallbackQuery({
    text: event,
  });
  await ctx.reply('Send a msg that contains your wish ', {
    reply_markup: {
      force_reply: true,
    },
  });
};

export const FinalReply = async (ctx: Filter<BotContext, 'message'>) => {
  if (ctx.session.eventName) {
    const wish = ctx.message.text || '';
    ctx.session.wish = wish;
    const eventName = ctx.session.eventName;
    const name = ctx.message.from.username;
    const collection = await Database.getMongoRepository(Wishes).findOneBy({
      eventName: eventName,
      teleUser: name,
    });

    if (!collection) {
      await Database.getMongoRepository(Wishes).save({
        eventName: eventName,
        teleUser: name,
        wishText: wish,
      });
      await ctx.reply('Wish Received');
    } else {
      await Database.getMongoRepository(Wishes).updateOne(
        { teleUser: name, eventName: eventName },
        { $set: { wishText: wish } }
      );
      await ctx.reply('Wish Overrided');
    }
    ctx.session = initial();
  }
};
