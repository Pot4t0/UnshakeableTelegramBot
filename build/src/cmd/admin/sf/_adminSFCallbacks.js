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
exports.adminSF = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
const _index_2 = require("../../../database_mongoDB/functions/_index");
const _adminSFInternal_1 = require("./_adminSFInternal");
const _telefunctions_1 = require("../../../app/_telefunctions");
const adminSF = (bot) => {
    // SF Reminder
    bot.callbackQuery('manageSFReminder', reminderManagement);
    bot.callbackQuery('sendReminder-Admin', sendNotInReminder);
    bot.callbackQuery('manualSF', manualSF);
    bot.callbackQuery(/^manualSFName-/g, sendsf);
    bot.callbackQuery(/^manualSendSF-/g, manualSFYesNo);
    _index_2.team.teamManagement(bot, 'Admin');
    bot.callbackQuery('excludeFromReminder', excludeFromReminderMenu);
    bot.callbackQuery('addExcludeUser', excludeFromReminder);
    bot.callbackQuery(/^excludeUser-/g, excludeFromReminderFunction);
    bot.callbackQuery('removeExcludeUser', removeExcludeFromReminder);
    bot.callbackQuery(/^rmExcludeUser-/g, removeExcludeFromReminderFunction);
};
exports.adminSF = adminSF;
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield _index_2.reminder.reminderMenu(ctx, 'Admin');
});
const sendNotInReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield _index_2.reminder.reminderSendAllNotIn_ReminderMessage(ctx);
});
const manualSF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `manualSFName-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Welcome to Unshakeable Telegram Bot\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
});
const sendsf = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    ctx.session.name = yield ctx.update.callback_query.data.substring('manualSFName-'.length);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Yes',
                callback_data: 'manualSendSF-yes',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'manualSendSF-no',
            },
        ],
    ]);
    yield ctx.reply('Attendance', {
        reply_markup: inlineKeyboard,
    });
});
const manualSFYesNo = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('manualSendSF-'.length);
    if (callback == 'yes') {
        const sfmsg = '';
        yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
        const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
        const teleUserName = (yield ctx.session.name) || '';
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        yield sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: sfmsg,
            attendance: 'Yes',
            reason: '',
        });
        yield ctx.reply('Sent!');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
    else if (callback == 'no') {
        yield ctx.reply(`
    Reason
    `, {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _adminSFInternal_1.adminSFBotOn.manualSFNoFunction;
    }
    else {
        yield ctx.reply('ERROR! Pls try again.');
        ctx.session = yield (0, _SessionData_1.initial)();
    }
});
const excludeFromReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const excludeNamesArr = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (!excludeNamesArr) {
        const newExcludeNames = new _tableEntity_1.Settings();
        newExcludeNames.option = 'SF Exclude';
        newExcludeNames.config = [];
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).save(newExcludeNames);
    }
    else {
        const excludeNames = excludeNamesArr.config;
        const listedName = name.map((n) => {
            if (!excludeNames.includes(n.teleUser)) {
                return [
                    { text: n.nameText, callback_data: 'excludeUser-' + n.teleUser },
                ];
            }
            else {
                return [];
            }
        });
        if (listedName.length > 0) {
            const inlineKeyboard = new grammy_1.InlineKeyboard(listedName);
            yield ctx.reply('Choose user to exclude for SF reminder:', {
                reply_markup: inlineKeyboard,
            });
        }
        else {
            yield ctx.reply('All users are already excluded from SF reminder');
        }
    }
});
const excludeFromReminderMenu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Add User for Exclusion',
                callback_data: 'addExcludeUser',
            },
        ],
        [
            {
                text: 'Remove User from Exclusion',
                callback_data: 'removeExcludeUser',
            },
        ],
    ]);
    yield ctx.reply('Exclude user from SF reminder?', {
        reply_markup: inlineKeyboard,
    });
});
const excludeFromReminderFunction = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const teleUserName = ctx.update.callback_query.data.substring('excludeUser-'.length);
    const excludeNamesArr = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'SF Exclude' }, { $set: { config: excludeNamesArr.config.concat(teleUserName) } });
    }
    else {
        const newExcludeNames = new _tableEntity_1.Settings();
        newExcludeNames.option = 'SF Exclude';
        newExcludeNames.config = [teleUserName];
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).save(newExcludeNames);
    }
    yield ctx.reply(`User ${teleUserName} excluded from SF reminder`);
});
const removeExcludeFromReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const excludeNamesArr = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        const excludeNames = excludeNamesArr.config;
        const inlineKeyboard = new grammy_1.InlineKeyboard(excludeNames.map((n) => [
            {
                text: n,
                callback_data: `rmExcludeUser-${n}`,
            },
        ]));
        yield ctx.reply('Choose user to remove from exclusion:', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('No user is excluded from SF reminder');
    }
});
const removeExcludeFromReminderFunction = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const teleUserName = ctx.update.callback_query.data.substring('rmExcludeUser-'.length);
    const excludeNamesArr = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'SF Exclude' }, {
            $set: {
                config: excludeNamesArr.config.filter((n) => n !== teleUserName),
            },
        });
        yield ctx.reply(`User ${teleUserName} removed from exclusion`);
    }
    else {
        yield ctx.reply('No user is excluded from SF reminder');
    }
});
