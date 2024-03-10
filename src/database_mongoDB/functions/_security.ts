import { CommandContext, Context } from 'grammy';
import { Database } from '../_db-init';
import { Names } from '../Entity/_tableEntity';
import { BotContext } from '../../app/_context';

//Creates security access for any function (Welfare, Bday, etc)
export const roleAccess = async (role: string[], ctx: Context) => {
  let teleUserList = [];
  let access;
  for (let i = 0; i < role.length; i++) {
    access = await Database.getMongoRepository(Names).find({
      role: role[i],
    });
    teleUserList.push(access.map((x) => x.teleUser.toString()));
  }
  teleUserList = teleUserList.flat();
  const user = ctx.message?.from.username || 'FAIL';
  return teleUserList.includes(user);
};

//Lock Out Middleware Function
export const checkUserInDatabaseMiddleware = async (
  ctx: CommandContext<BotContext>,
  next: () => Promise<void>
) => {
  const currentUser = ctx.message?.from.username || 'FAIL';
  const userExists = await Database.getMongoRepository(Names).find({
    teleUser: currentUser,
  });
  if (userExists) {
    await next(); // User is in the database, proceed to the next middleware or command function
  } else {
    await ctx.reply(
      'You are not authorized to use this command. Please contact your IT representative for assistance.'
    );
  }
};
