import { DateTime } from 'luxon';
import { BotContext } from '../app/_context';
import { Names, SF_mongo } from '../database_mongoDB/Entity/_tableEntity';
import { Database } from '../database_mongoDB/_db-init';
import { dbMessaging } from '../database_mongoDB/functions/_index';
import { Bot } from 'grammy';

export const automated = (bot: Bot<BotContext>) => {
  const minute = DateTime.local().setZone('Asia/Singapore').minute;
  const hour = DateTime.local().setZone('Asia/Singapore').hour;
  if (hour == 14)
    bot.api.sendMessage(611527651, `Hour: ${hour} Minute: ${minute}`);
};

const sfAutoReminder = async (ctx: BotContext) => {
  const weekend = DateTime.local().setZone('Asia/Singapore').isWeekend;
  if (weekend) {
    console.log('Weekend');
  } else {
    console.log('Not Weekend');
  }
  //   const sendDate = new Date().getDate();
  //   if (sendDate == 0 || sendDate == 6) {
  //     // Send SF Reminder
  //     // Get all users
  //     // Get all users who have not submitted SF
  //     // Send reminder to them
  //     const prefix = `<b>Automated Reminder Message</b>`;
  //     const reminderMsg = `Reminder to submit your SF! \nPlease submit your SF ASAP!`;
  //     const now = new Date();
  //     const offSetDate = new Date(
  //       now.getFullYear(),
  //       now.getMonth(),
  //       now.getDate() - 4
  //     );
  //     console.log('Date: ' + offSetDate);
  //     const InSF = await Database.getMongoRepository(SF_mongo).find({
  //       where: {
  //         timestamp: { $gte: offSetDate },
  //       },
  //     });
  //     const notInNamesAdmin = await Database.getMongoRepository(Names).find({
  //       where: {
  //         teleUser: { $not: { $in: InSF.map((n) => `${n.teleUser}`) } },
  //       },
  //     });
  //     const notInUsersAdmin = notInNamesAdmin
  //       .map((n) => `${n.teleUser}`)
  //       .filter((n) => n != '');
  //     await Promise.all(
  //       notInUsersAdmin.map(async (n) => {
  //         // await dbMessaging.sendMessageUser(n, prefix + reminderMsg, ctx);
  //         console.log(prefix + reminderMsg + `(${n})`);
  //       })
  //     );
  //   }
};
