import { Context } from 'grammy';
import { Names } from '../Entity/_tableEntity';
import { Database } from '../_db-init';

/**
 * Send message to user
 * @param user The user to send the message to.
 * @param msg The message to send.
 * @param ctx The context object.
 * @returns The message sent.
 */
export const sendMessageUser = async (
  user: string,
  msg: string,
  ctx: Context
) => {
  const name = await Database.getMongoRepository(Names).findOneBy({
    teleUser: user,
  });
  if (name) {
    const message = await ctx.api.sendMessage(name.chat, msg, {
      parse_mode: 'HTML',
    });
    return message;
  } else {
    await ctx.reply(`Error in sending message to ${user}!`);
    console.log(`Error in sending message to ${user}!`);
  }
};
