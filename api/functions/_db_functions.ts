import { Context } from 'grammy';
import { Names } from '../database_mongoDB/Entity/_tableEntity';
import { Database } from '../database_mongoDB/_db-init';

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

//Send to User in their respective ChatId with telegram bot
export const sendMessageUser = async (
  user: string,
  msg: string,
  ctx: Context
) => {
  const name = await Database.getMongoRepository(Names).find({
    teleUser: user,
  });
  if (name[0].chat != '') {
    await ctx.api.sendMessage(name[0].chat, msg);
  }
};
