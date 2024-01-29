import { Filter } from 'grammy';
import { BotContext } from '../../../app/_context';
import { Database } from '../../../database_mongoDB/_db-init';
import { initial } from '../../../models/_SessionData';
import { Wishes } from '../../../database_mongoDB/Entity/_tableEntity';

//Used in _botOn_functions.ts in botOntype = 1
export const sendWish_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const wish = ctx.message.text;
  ctx.session.wish = wish;
  try {
    if (wish == null) {
      sendWish_Execution(ctx);
    }
    const eventName = ctx.session.eventName;
    const name = ctx.message.from.username;
    if (eventName || name) {
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
        await ctx.reply(`Wish Received for ${eventName}`);
      } else {
        await Database.getMongoRepository(Wishes).updateOne(
          { teleUser: name, eventName: eventName },
          { $set: { wishText: wish } }
        );
        await ctx.reply(`Wish Overriden for ${eventName}`);
      }
    } else {
      await ctx.reply(`Wish Send Failed! Please try again!`);
    }
  } catch (err) {
    await ctx.reply(`Wish Send Failed! Please try again!`);
    console.log(err);
  }
  ctx.session = initial();
};
