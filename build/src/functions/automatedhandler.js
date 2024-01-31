"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.automated = void 0;
const luxon_1 = require("luxon");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const automated = (bot) => {
    bot.use(schedulerChat, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const scheduler = ctx.session.scheduler;
        const schedulerChatID = ctx.session.chatId;
        if (scheduler && schedulerChatID) {
            const isBot = (_b = (_a = ctx.msg) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.is_bot;
            if (isBot) {
            }
            else {
                yield ctx.reply('You are not a bot. Please do not spam me.');
            }
        }
        else {
            console.log('Scheduler not found');
        }
    }));
};
exports.automated = automated;
const schedulerChat = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduler = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOne({
        where: { option: 'Scheduler' },
    });
    if (scheduler) {
        ctx.session.scheduler = scheduler;
        ctx.session.chatId = parseInt(scheduler.config[0]);
        yield next();
    }
    else {
        console.log('Scheduler not found');
    }
});
const sfAutoReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const weekend = luxon_1.DateTime.local().setZone('Asia/Singapore').isWeekend;
    if (weekend) {
        console.log('Weekend');
    }
    else {
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
});
