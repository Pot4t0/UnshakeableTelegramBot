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
exports.commands = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _gsheet_init_1 = require("../gsheets/_gsheet_init");
const _index_1 = require("../gsheets/_index");
const _index_2 = require("../database_mongoDB/functions/_index");
// /start, /help, /settings, /sendsf, /sendwish, /sendattendance, /adminwelfare, /adminbday, /adminsf, /adminattendance
// This file contains all the commands that the bot can call
// Refer to each respective callback function for more details on the command
//All the commands that the bot can call
const commands = (bot) => {
    //Call /start command
    bot.command('start', _index_2.dbSecurity.checkUserInDatabaseMiddleware, start);
    //Call /help command
    bot.command('help', _index_2.dbSecurity.checkUserInDatabaseMiddleware, help);
    //Call /settings command
    bot.command('settings', _index_2.dbSecurity.checkUserInDatabaseMiddleware, settings);
    //Call /sendsf command
    bot.command('sendsf', _index_2.dbSecurity.checkUserInDatabaseMiddleware, sendsf);
    //Call /sendwish command
    bot.command('sendwish', _index_2.dbSecurity.checkUserInDatabaseMiddleware, sendWish);
    //Call /attendance
    bot.command('sendattendance', _index_2.dbSecurity.checkUserInDatabaseMiddleware, sendattendance);
    //Call /adminWelfare command
    bot.command('adminwelfare', _index_2.dbSecurity.checkUserInDatabaseMiddleware, adminWelfare);
    //Call /adminbday
    bot.command('adminbday', _index_2.dbSecurity.checkUserInDatabaseMiddleware, adminbday);
    //Call /adminsf
    bot.command('adminsf', _index_2.dbSecurity.checkUserInDatabaseMiddleware, adminsf);
    //Call /adminattendance
    bot.command('adminattendance', _index_2.dbSecurity.checkUserInDatabaseMiddleware, adminattendance);
};
exports.commands = commands;
//Start command
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `nameStart-${n.nameText}`,
        },
    ]));
    yield ctx.reply('Welcome to Unshakeable Telegram Bot 🤖\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
});
//Help command
const help = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (((_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.chat.type) !== 'private') {
        return false;
    }
    yield ctx.reply(`
	Help List
  \nIf there is any issue within the Bot or any feedback pls pm @whysominh for technical help ☺️
  \n/help --> Help List
  \n/settings --> Settings list
  \n/sendsf --> Send sermon feedback for the week
	\n/sendwish -->  Send wishes to upcoming welfare events
  \n/sendattendance -->  Send whether coming to LG/WE
	\n/adminwelfare --> Management of admin for Welfare Team (only accessible to serving members)
  \n/adminbday --> Management of admin for Bday Team (only accessible to serving members)
  \n/adminsf --> Management of sermon feedback for Admin Team (only accessible to serving members)
  \n/adminattendance --> Management of attendance
	`);
});
//Settings command
const settings = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    if (((_c = ctx.update.message) === null || _c === void 0 ? void 0 : _c.chat.type) !== 'private') {
        return false;
    }
    const access = yield _index_2.dbSecurity.roleAccess(['SGL', 'LGL', 'it'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Bot Announcements',
                    callback_data: 'settingsAnnouncements',
                },
            ],
            [
                {
                    text: 'Create a New User',
                    callback_data: 'settingsNewUser',
                },
            ],
            [
                {
                    text: 'Delete Existing User',
                    callback_data: 'settingsDeleteUser',
                },
            ],
        ]);
        yield ctx.reply('Settings \n Only LGL,SGL & IT personnel can access this', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('No Access to Bot Settings');
    }
});
//Send SF command
const sendsf = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    if (((_d = ctx.update.message) === null || _d === void 0 ? void 0 : _d.chat.type) !== 'private') {
        return false;
    }
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Yes 🙂',
                callback_data: 'AttendanceSF-yes',
            },
        ],
        [
            {
                text: 'No 🙁',
                callback_data: 'AttendanceSF-no',
            },
        ],
    ]);
    yield ctx.reply(`Hi there! We will be collecting sermon feedback every week!
  \nFor those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \nPlease fill up this by SUNDAY, 7 PM! 🤗
  \n\nDid you attend service/watched online?
  `, {
        reply_markup: inlineKeyboard,
    });
});
//Send Wish command
const sendWish = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    if (((_e = ctx.update.message) === null || _e === void 0 ? void 0 : _e.chat.type) !== 'private') {
        return false;
    }
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: (_f = ctx.update.message) === null || _f === void 0 ? void 0 : _f.from.username,
    });
    const event = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        where: {
            notAllowedUser: { $not: { $in: user.map((n) => n.nameText) } },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((e) => [
        {
            text: e.eventName,
            callback_data: `eventName-${e.eventName}`,
        },
    ]));
    yield ctx.reply('Choose upcoming Event ', {
        reply_markup: inlineKeyboard,
    });
});
//Send Attendance command
const sendattendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    if (((_g = ctx.update.message) === null || _g === void 0 ? void 0 : _g.chat.type) !== 'private') {
        return false;
    }
    const archivedSheets = _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Archive',
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const archivedSheetsArray = (yield archivedSheets)
        .map((n) => n.archive)
        .flat();
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .filter((n) => !archivedSheetsArray.includes(n.title))
        .map((n) => [
        { text: n.title, callback_data: `svcLGAttendance-${n.title}` },
    ]));
    yield ctx.reply(`Hi there! We will be collecting attendance every week!
  \nSelect the respective worship experience.`, {
        reply_markup: inlineKeyboard,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
//Admin Welfare command
const adminWelfare = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    if (((_h = ctx.update.message) === null || _h === void 0 ? void 0 : _h.chat.type) !== 'private') {
        return false;
    }
    const access = yield _index_2.dbSecurity.roleAccess(['welfare', 'welfareIC', 'LGL', 'it'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Manage Welfare Events',
                    callback_data: 'manageWelfareEvent',
                },
            ],
            [
                {
                    text: 'Manage Welfare Team',
                    callback_data: 'manageWelfareTeam',
                },
            ],
            [
                {
                    text: 'View Wishes',
                    callback_data: 'WelfareWishView',
                },
            ],
            [
                {
                    text: 'Send Reminder',
                    callback_data: 'manageWelfareReminder',
                },
            ],
        ]);
        yield ctx.reply(`
	Welfare Team Admin Matters
	\nYou can view all wishes and send reminders for all welfare events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('AIYO! You are not serving in Welfare. Hence, you cant access this :(');
    }
});
//Admin Birthday command
const adminbday = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    if (((_j = ctx.update.message) === null || _j === void 0 ? void 0 : _j.chat.type) !== 'private') {
        return false;
    }
    const access = yield _index_2.dbSecurity.roleAccess(['bday', 'bdayIC', 'LGL', 'it'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Manage Birthday Events',
                    callback_data: 'manageBirthdayEvent',
                },
            ],
            [
                {
                    text: 'Manage Birthday Team',
                    callback_data: 'manageBirthdayTeam',
                },
            ],
            [
                {
                    text: 'See Wishes',
                    callback_data: 'BirthdayWishView',
                },
            ],
            [
                {
                    text: 'Send Reminder',
                    callback_data: 'manageBirthdayReminder',
                },
            ],
        ]);
        yield ctx.reply(`
	Birthday Team Admin Matters

	\nYou can view all wishes and send reminders for all birthday events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('AIYO! You are not serving in Birthday. Hence, you cant access this :(');
    }
});
//Admin Sermon Feedback command
const adminsf = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    if (((_k = ctx.update.message) === null || _k === void 0 ? void 0 : _k.chat.type) !== 'private') {
        return false;
    }
    const access = yield _index_2.dbSecurity.roleAccess(['admin', 'adminIC', 'LGL', 'it'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Send Reminder',
                    callback_data: 'manageSFReminder',
                },
            ],
            [
                {
                    text: 'Manual Send SF',
                    callback_data: 'manualSF',
                },
            ],
        ]);
        yield ctx.reply(`
	Admin Team Admin Matters

	\nYou can send reminders for sermon feedback
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('AIYO! You are not serving in Admin. Hence, you cant access this :(');
    }
});
//Admin Attendance command
const adminattendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    if (((_l = ctx.update.message) === null || _l === void 0 ? void 0 : _l.chat.type) !== 'private') {
        return false;
    }
    const access = yield _index_2.dbSecurity.roleAccess(['SGL', 'LGL', 'it'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Add Attendance Google Sheet',
                    callback_data: 'addAttendanceSheet',
                },
            ],
            [
                {
                    text: 'Delete Attendance Google Sheet',
                    callback_data: 'delAttendanceSheet',
                },
            ],
            [
                {
                    text: 'Send Reminders',
                    callback_data: 'manageAttendanceReminder',
                },
            ],
            [
                {
                    text: 'Send to Chat',
                    callback_data: 'chatAttendance',
                },
            ],
            [
                {
                    text: 'Archive Attendance Sheet',
                    callback_data: 'archiveAttendance',
                },
            ],
            [
                {
                    text: 'Unarchive Attendance Sheet',
                    callback_data: 'unarchiveAttendance',
                },
            ],
        ]);
        yield ctx.reply(`
	Unshakeable Attendance Matters

	\nOnly accessible to LG/SGL leaders (Exception made for IT)
  \nDo not edit the google sheet as it might tamper with the TeleBot algorithm
	\n\nInstructions:
	\n1. Create a new google sheet every week to collect attendance
  \n2. Delete old google sheets to declutter the google sheet
  \n3. Use reminder system to chase those that did not submit
  \n4. Archive old attendance sheets
  \n5. Unarchive archived attendance
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('AIYO! You are our LGL/SGL. Hence, you cant access this :(');
    }
});
