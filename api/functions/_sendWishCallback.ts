import { CallbackQueryContext, Filter, webhookCallback } from 'grammy';

import { BotContext } from '../app/_context';
import { Database } from '../database_mongoDB/_db-init';
import { initial } from '../models/_SessionData';
import { Wishes } from '../database_mongoDB/Entity/_tableEntity';

export const EventReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const event = ctx.update.callback_query.data.substring('eventName-'.length);
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = event;
  ctx.session.botOnType = 1;
  await ctx.answerCallbackQuery({
    text: event,
  });
  await ctx.reply('Send a wish msg', {
    reply_markup: {
      force_reply: true,
    },
  });
};

export const FinalReply = async (ctx: Filter<BotContext, 'message'>) => {
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
    await ctx.reply(`Wish Received$ ${eventName}`);
  } else {
    await Database.getMongoRepository(Wishes).updateOne(
      { teleUser: name, eventName: eventName },
      { $set: { wishText: wish } }
    );
    await ctx.reply(`Wish Overrided to ${eventName}`);
  }
  ctx.session = initial();
  // }
};
