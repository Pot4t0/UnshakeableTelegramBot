import { Context } from 'grammy';
import { Names } from '../Entity/_tableEntity';
import { Database } from '../_db-init';

//Send to User in their respective ChatId with telegram bot
export const sendMessageUser = async (
  user: string,
  msg: string,
  ctx: Context
) => {
  const name = await Database.getMongoRepository(Names).find({
    teleUser: user,
  });
  const message = await ctx.api.sendMessage(name[0].chat, msg, {
    parse_mode: 'HTML',
  });
  return message;
};
