import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';

import { BotContext } from '../app/context';
import { Database } from '../database/db-init';
import { NameTable, WishTable } from '../database/Entity/tableEntity';
import { initial } from '../models/SessionData';

export const EventReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const event = ctx.update.callback_query.data.substring('eventName-'.length);
  ctx.session.eventName = event;
  const names = await Database.getRepository(NameTable).find();
  // query.select("nameTable", "text");
  const inlineKeyboard = new InlineKeyboard(
    names.map((n) => [
      {
        text: n.text,
        callback_data: `name-${n.text}`,
      },
    ])
  );
  await ctx.answerCallbackQuery({
    text: event,
  });
  await ctx.reply('Select your name ', {
    reply_markup: inlineKeyboard,
  });
};
export const NameReply = async (ctx: CallbackQueryContext<BotContext>) => {
  const name = ctx.update.callback_query.data.substring('name-'.length);
  ctx.session.name = name;

  await ctx.answerCallbackQuery({
    text: name,
  });
  await ctx.reply('Send a msg that contains your wish ', {
    reply_markup: {
      force_reply: true,
    },
  });
};
export const FinalReply = async (ctx: Filter<BotContext, 'message'>) => {
  if (ctx.session.eventName && ctx.session.name) {
    try {
      const wish = ctx.message.text || '';
      ctx.session.wish = wish;
      const eventName = ctx.session.eventName;
      const name = ctx.session.name;
      const wishSent = await Database.getRepository(WishTable).save({
        eventName,
        name,
        wish,
      });
      // query.insert("wishTable", ['eventName','name', 'wish'], [eventName,name,wish]);
      ctx.reply('Wish Received');
      ctx.session = initial();
    } catch (err) {
      console.log(err);
    }
  }
};

// receiving: {
// 	receiver: Person;
// 	date: Date;
// };
// card :{
// 	maker: Person;
// 	date: Date
// }
// wishes: {
// 	collector: Person[];
// 	date:Date;
// }
// gift: {
// 	buyer: Person;
// 	date:Date;
// }
// planning: {
// 	planner: Person[];
// }
