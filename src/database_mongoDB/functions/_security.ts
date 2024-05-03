import { CommandContext, Context } from 'grammy';
import { Database } from '../_db-init';
import { Names } from '../Entity/_tableEntity';
import { BotContext } from '../../app/_context';

/**
 * Check if user has access to the function (Welfare, Bday, etc)
 * @param role The role to check for access.
 * @param ctx The context object.
 * @returns Whether the user has access to the function.
 */
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

/**
 * Check if user is in the database
 * Lock Out Middleware Function
 * @param ctx The context object.
 * @param next The next middleware function.
 * @returns The next middleware function or command function.
 * @throws Error if user is not in the database.
 */
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
