import { Context } from 'grammy';
import { Names } from '../database_mongoDB/Entity/tableEntity';
import { Database } from '../database_mongoDB/db-init';

//Creates security access for any function (Welfare, Bday, etc)
export const roleAccess = async (role: string[], ctx: Context) => {
  let teleUserList = [];
  let access;
  for (let i = 0; i < role.length; i++) {
    access = await Database.getMongoRepository(Names).find({
      role: role[i],
    });
    teleUserList.push(access.map((x) => x.teleUser.toString()));
    // teleUserList.push(access.filter((n) => n.teleUser).toString());
  }
  teleUserList = teleUserList.flat();

  console.log(teleUserList);
  const user = ctx.message?.from.username || 'FAIL';
  return teleUserList.includes(user);
};

export const sendMessageUser = async (
  user: string,
  msg: string,
  ctx: Context
) => {
  const name = await Database.getMongoRepository(Names).find({
    teleUser: user,
  });
  const chatid = +name.map((n) => `${n.chat}`);
  ctx.api.sendMessage(chatid, msg);
};
