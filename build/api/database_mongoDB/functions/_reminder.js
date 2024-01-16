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
exports.sendSpecificReminder_Execution = exports.specificReminder = exports.reminderSendAllNotIn_Execution = exports.reminderSendAllNotIn_ReminderMessage = exports.reminderMenu = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _index_1 = require("../../gsheets/_index");
const _SessionData_1 = require("../../models/_SessionData");
const _index_2 = require("./_index");
// Reminder System
// Database - contaims all chatid and telegramm username
// Telegram - send message to respective chatid
// Team - string of team name (Attendance, Welfare, Admin, Birthday)
// Used in _botOn_functions.ts in botOntype = 2 and 3
const reminderMenu = (ctx, team) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.team = team;
    let teamMessage;
    const callbackData = `sendReminder-${team}`;
    switch (team) {
        case 'Attendance':
            teamMessage = 'attendance';
            ctx.session.text = 'sendattendance';
            break;
        case 'Welfare':
            teamMessage = 'welfare wish';
            ctx.session.text = 'sendwish';
            break;
        case 'Admin':
            teamMessage = 'sermon feedback';
            ctx.session.text = 'sendsf';
            break;
        case 'Birthday':
            teamMessage = 'birthday wish';
            ctx.session.text = 'sendwish';
            break;
        default:
            yield ctx.reply('Error in Reminder System!');
            console.log('Error in Reminder System! Check team name got put properly!');
            teamMessage = null;
            break;
    }
    if (teamMessage) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: `Send to ALL members who yet to send their ${teamMessage}`,
                    callback_data: callbackData,
                },
            ],
            [
                {
                    text: 'Send to specific member',
                    callback_data: 'sendSpecificReminder',
                },
            ],
        ]);
        yield ctx.reply(`
			Choose option
			\n(Send all option will exclude the person its for)
  
			\nDO NOT ABUSE THE REMINDER SYSTEM.
			`, {
            reply_markup: inlineKeyboard,
        });
    }
});
exports.reminderMenu = reminderMenu;
// Reminder System - Send to ALL not in users
// Write reminder msg for all not in users
const reminderSendAllNotIn_ReminderMessage = (ctx, gsheet) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.gSheet = gsheet;
    yield ctx.reply(`Write down the reminder msg for people that have not sent it in
	\nSuggestion to put /${ctx.session.text} so that user can click on it`, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 2;
});
exports.reminderSendAllNotIn_ReminderMessage = reminderSendAllNotIn_ReminderMessage;
// Send Reminder Message to ALL not in users
// Used in _botOn_functions.ts in botOntype = 2
const reminderSendAllNotIn_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const reminderMsg = ctx.message.text;
    if (reminderMsg == null) {
        (0, exports.reminderSendAllNotIn_Execution)(ctx);
    }
    const team = ctx.session.team;
    const prefix = `<b>${team} Team:</b>\n`;
    switch (team) {
        case 'Attendance':
            const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: { teleUser: { $not: { $eq: '' } } },
            });
            const sheet = ctx.session.gSheet;
            if (sheet) {
                yield sheet.loadCells();
                yield Promise.all(totalNames.map((i) => __awaiter(void 0, void 0, void 0, function* () {
                    const checkCell = yield sheet.getCellByA1(`C${i.attendanceRow}`);
                    if (checkCell.value == null) {
                        yield _index_2.dbMessaging.sendMessageUser(i.teleUser, prefix + reminderMsg, ctx);
                        console.log(prefix + reminderMsg + `(${i.teleUser})`);
                    }
                })));
                _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                yield ctx.reply(`Reminder sent!`);
            }
            else {
                yield ctx.reply(`Error in sending reminder!`);
            }
            break;
        case 'Welfare':
        case 'Birthday':
            const wishEventName = ctx.session.name;
            const inWishes = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
                eventName: wishEventName,
            });
            const notAllowedName = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
                eventName: wishEventName,
            });
            console.log(wishEventName);
            const notAllowedUser = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                nameText: notAllowedName[0].notAllowedUser,
            });
            const notInNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    teleUser: {
                        $not: {
                            $in: yield inWishes
                                .map((n) => n.teleUser)
                                .concat(notAllowedUser.map((n) => n.teleUser)),
                        },
                    },
                },
            });
            const notInUsers = yield notInNames
                .map((n) => n.teleUser)
                .filter((n) => n != '');
            yield Promise.all(notInUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
                yield _index_2.dbMessaging.sendMessageUser(n, prefix + reminderMsg, ctx);
                console.log(prefix + reminderMsg + `(${n})`);
            })));
            yield ctx.reply(`Reminder sent!`);
            break;
        case 'Admin':
            const now = new Date();
            const offSetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
            console.log('Date: ' + offSetDate);
            const InSF = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).find({
                where: {
                    timestamp: { $gte: offSetDate },
                },
            });
            const notInNamesAdmin = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    teleUser: { $not: { $in: yield InSF.map((n) => `${n.teleUser}`) } },
                },
            });
            const notInUsersAdmin = notInNamesAdmin
                .map((n) => `${n.teleUser}`)
                .filter((n) => n != '');
            yield Promise.all(notInUsersAdmin.map((n) => __awaiter(void 0, void 0, void 0, function* () {
                yield _index_2.dbMessaging.sendMessageUser(n, prefix + reminderMsg, ctx);
                console.log(prefix + reminderMsg + `(${n})`);
            })));
            yield ctx.reply(`Reminder sent!`);
            break;
        default:
            yield ctx.reply('Error in Reminder System!');
            console.log('Error in Reminder System! Check sessions got put properly!');
            break;
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.reminderSendAllNotIn_Execution = reminderSendAllNotIn_Execution;
// Reminder System - Send to specific user
// Used in bot.ts
const specificReminder = (bot) => __awaiter(void 0, void 0, void 0, function* () {
    bot.callbackQuery('sendSpecificReminder', sendSpecificReminder_ChooseMember);
    bot.callbackQuery(/^reminderSpecificNames-/, sendSpecificReminder_ReminderMsg);
});
exports.specificReminder = specificReminder;
// Choose specific user to send reminder
const sendSpecificReminder_ChooseMember = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `reminderSpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
// Write reminder msg for specific user
const sendSpecificReminder_ReminderMsg = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderSpecificNames-'.length);
    ctx.session.reminderUser = telegramUser;
    const cmdString = ctx.session.text;
    yield ctx.reply(`Write down the reminder msg that you want to send to @${telegramUser}
		  \nSuggestion to put /${cmdString} so that user can click on it
		  `, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 3;
});
// Send Reminder Message to specific user
// Used in _botOn_functions.ts in botOntype = 3
//Uses botOnType = 3 to work
const sendSpecificReminder_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const team = ctx.session.team;
    const teleUser = ctx.session.reminderUser;
    if (teleUser) {
        const prefix = `<b>${team} Team:</b>\n`;
        const reminder = yield ctx.message.text;
        if (reminder == null) {
            (0, exports.sendSpecificReminder_Execution)(ctx);
        }
        yield _index_2.dbMessaging.sendMessageUser(teleUser, prefix + reminder, ctx);
        console.log(prefix + reminder + `(${teleUser})`);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendSpecificReminder_Execution = sendSpecificReminder_Execution;
