"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSF = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../database_mongoDB/functions/_index");
const _adminSFInternal_1 = require("./_adminSFInternal");
const _telefunctions_1 = require("../../../app/_telefunctions");
const _initialise_1 = require("../../../functions/_initialise");
const adminSF = (bot) => {
    // SF Reminder
    bot.callbackQuery('manageSFReminder', reminderManagement);
    bot.callbackQuery('sendReminder-Admin', sendNotInReminder);
    bot.callbackQuery('manualSF', manualSF);
    bot.callbackQuery(/^manualSFName-/g, sendsf);
    bot.callbackQuery(/^manualSendSF-/g, manualSFYesNo);
    _index_1.team.teamManagement(bot, 'Admin');
    bot.callbackQuery('excludeFromReminder', excludeFromReminderMenu);
    bot.callbackQuery('addExcludeUser', excludeFromReminder);
    bot.callbackQuery(/^excludeUser-/g, excludeFromReminderFunction);
    bot.callbackQuery('removeExcludeUser', removeExcludeFromReminder);
    bot.callbackQuery(/^rmExcludeUser-/g, removeExcludeFromReminderFunction);
};
exports.adminSF = adminSF;
// Reminder Management
const reminderManagement = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await _index_1.reminder.reminderMenu(ctx, 'Admin');
};
const sendNotInReminder = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await _index_1.reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};
const manualSF = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `manualSFName-${n.teleUser}`,
        },
    ]));
    await ctx.reply('Welcome to Unshakeable Telegram Bot\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
};
const sendsf = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    ctx.session.name = await ctx.update.callback_query.data.substring('manualSFName-'.length);
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
    await ctx.reply('Attendance', {
        reply_markup: inlineKeyboard,
    });
};
const manualSFYesNo = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = await ctx.update.callback_query.data.substring('manualSendSF-'.length);
    if (callback == 'yes') {
        const sfmsg = '';
        const unshakeableSFSpreadsheet = await (0, _initialise_1.gsheet)('sf');
        const sheet = unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
        const teleUserName = (await ctx.session.name) || '';
        const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        await sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: sfmsg,
            attendance: 'Yes',
            reason: '',
        });
        await ctx.reply('Sent!');
        unshakeableSFSpreadsheet.resetLocalCache();
        ctx.session = (0, _SessionData_1.initial)();
    }
    else if (callback == 'no') {
        await ctx.reply(`
    Reason
    `, {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _adminSFInternal_1.adminSFBotOn.manualSFNoFunction;
    }
    else {
        await ctx.reply('ERROR! Pls try again.');
        ctx.session = await (0, _SessionData_1.initial)();
    }
};
const excludeFromReminder = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const excludeNamesArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (!excludeNamesArr) {
        const newExcludeNames = new _tableEntity_1.Settings();
        newExcludeNames.option = 'SF Exclude';
        newExcludeNames.config = [];
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).save(newExcludeNames);
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
            await ctx.reply('Choose user to exclude for SF reminder:', {
                reply_markup: inlineKeyboard,
            });
        }
        else {
            await ctx.reply('All users are already excluded from SF reminder');
        }
    }
};
const excludeFromReminderMenu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
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
    await ctx.reply('Exclude user from SF reminder?', {
        reply_markup: inlineKeyboard,
    });
};
const excludeFromReminderFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const teleUserName = ctx.update.callback_query.data.substring('excludeUser-'.length);
    const excludeNamesArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'SF Exclude' }, { $set: { config: excludeNamesArr.config.concat(teleUserName) } });
    }
    else {
        const newExcludeNames = new _tableEntity_1.Settings();
        newExcludeNames.option = 'SF Exclude';
        newExcludeNames.config = [teleUserName];
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).save(newExcludeNames);
    }
    await ctx.reply(`User ${teleUserName} excluded from SF reminder`);
};
const removeExcludeFromReminder = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const excludeNamesArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        const excludeNames = excludeNamesArr.config;
        const inlineKeyboard = new grammy_1.InlineKeyboard(excludeNames.map((n) => [
            {
                text: n,
                callback_data: `rmExcludeUser-${n}`,
            },
        ]));
        await ctx.reply('Choose user to remove from exclusion:', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        await ctx.reply('No user is excluded from SF reminder');
    }
};
const removeExcludeFromReminderFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const teleUserName = ctx.update.callback_query.data.substring('rmExcludeUser-'.length);
    const excludeNamesArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({ option: 'SF Exclude' });
    if (excludeNamesArr) {
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'SF Exclude' }, {
            $set: {
                config: excludeNamesArr.config.filter((n) => n !== teleUserName),
            },
        });
        await ctx.reply(`User ${teleUserName} removed from exclusion`);
    }
    else {
        await ctx.reply('No user is excluded from SF reminder');
    }
};
