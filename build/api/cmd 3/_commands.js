"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _index_1 = require("../database_mongoDB/functions/_index");
const _initialise_1 = require("../functions/_initialise");
const _index_2 = require("./admin/_index");
// /start, /help, /settings, /sendsf, /sendwish, /sendattendance, /adminwelfare, /adminbday, /adminsf, /adminattendance
// This file contains all the commands that the bot can call
// Refer to each respective callback function for more details on the command
/**
 * Sets up all the commands that the bot can call.
 * This function registers all the commands that the bot can call.
 * DB Security is used to check if the user is in the database before calling the command.
 * If user is not in the database, the user will not be able to call the command.
 * @param bot The Bot instance.
 */
const commands = (bot) => {
    //Call /start command
    bot.command('start', _index_1.dbSecurity.checkUserInDatabaseMiddleware, start);
    //Call /help command
    bot.command('help', _index_1.dbSecurity.checkUserInDatabaseMiddleware, help);
    //Call /settings command
    bot.command('settings', _index_1.dbSecurity.checkUserInDatabaseMiddleware, settings);
    //Call /sendsf command
    bot.command('sendsf', _index_1.dbSecurity.checkUserInDatabaseMiddleware, sendsf);
    //Call /sendwish command
    bot.command('sendwish', _index_1.dbSecurity.checkUserInDatabaseMiddleware, sendWish);
    //Call /sendclaim command
    bot.command('sendclaim', _index_1.dbSecurity.checkUserInDatabaseMiddleware, sendClaim);
    //Call /sendattendance
    bot.command('sendattendance', _index_1.dbSecurity.checkUserInDatabaseMiddleware, sendattendance);
    //Call /adminWelfare command
    bot.command('adminwelfare', _index_1.dbSecurity.checkUserInDatabaseMiddleware, adminWelfare);
    //Call /adminbday
    bot.command('adminbday', _index_1.dbSecurity.checkUserInDatabaseMiddleware, adminbday);
    //Call /adminsf
    bot.command('adminsf', _index_1.dbSecurity.checkUserInDatabaseMiddleware, adminsf);
    //Call /adminattendance
    bot.command('adminattendance', _index_1.dbSecurity.checkUserInDatabaseMiddleware, adminattendance);
    //Call /adminfinance
    bot.command('adminfinance', _index_1.dbSecurity.checkUserInDatabaseMiddleware, adminfinance);
};
exports.commands = commands;
/**
 * Handles the logic for the /start command.
 * This function sends a welcome message to the user and prompts them to select their name.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const start = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `nameStart-${n.nameText}`,
        },
    ]));
    await ctx.reply('Welcome to Unshakeable Telegram Bot 🤖\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Handles the logic for the /help command.
 * This function sends a list of available commands to the user.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const help = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    await ctx.reply(`
	Help List
  \nIf there is any issue within the Bot or any feedback pls pm @whysominh for technical help ☺️
  \n/help --> Help List
  \n/settings --> Settings list
  \n/sendsf --> Send sermon feedback for the week
	\n/sendwish -->  Send wishes to upcoming welfare events
  \n/sendattendance -->  Send whether coming to LG/WE
	\n/adminwelfare --> Management of admin for Welfare Team (only accessible to serving members)
  \n/adminbday --> Management of admin for Bday Events
  \n/adminsf --> Management of sermon feedback for Admin Team (only accessible to serving members)
  \n/adminattendance --> Management of attendance (only accessible to Admin Team)
	`);
};
/**
 * Handles the logic for the /settings command.
 * This function sends a list of settings that the user can configure.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 * @returns Returns false if the user does not have access to the settings.
 */
const settings = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const access = await _index_1.dbSecurity.roleAccess(['SGL', 'LGL', 'it'], ctx);
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
            [
                {
                    text: 'Change LG Telegram Group',
                    callback_data: 'changeChatLG',
                },
            ],
            [
                {
                    text: 'LG Leaders Management',
                    callback_data: 'manageLeadersTeam',
                },
            ],
            [
                {
                    text: 'Change Google Sheet',
                    callback_data: 'manageGSheet',
                },
            ],
        ]);
        await ctx.reply('Settings \n Only LGL,SGL & IT personnel can access this', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        await ctx.reply('No Access to Bot Settings');
    }
};
/**
 * Handles the logic for the /sendsf command.
 * This function for user to send sermon feedback.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const sendsf = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
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
    await ctx.reply(`Hi there! We will be collecting sermon feedback every week!
  \nFor those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \nPlease fill up this by SUNDAY, 7 PM! 🤗
  \n\nDid you attend service/watched online?
  `, {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Handles the logic for the /sendwish command.
 * This function is for user to send wishes to upcoming welfare / birthday events.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const sendWish = async (ctx) => {
    var _a, _b;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: (_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.from.username,
    });
    const event = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        where: {
            notAllowedUser: { $not: { $in: user.map((n) => n.nameText) } },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((e) => [
        {
            text: e.eventName,
            callback_data: `sendWishEvent-${e.eventName}`,
        },
    ]));
    await ctx.reply('Choose upcoming Birthday / Welfare Event ', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Handles the logic for the /sendattendance command.
 * This function is for user to send attendance.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const sendattendance = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const archivedSheets = _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Archive',
    });
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const archivedSheetsArray = (await archivedSheets)
        .map((n) => n.archive)
        .flat();
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .filter((n) => !archivedSheetsArray.includes(n.title))
        .map((n) => [
        { text: n.title, callback_data: `svcLGAttendance-${n.title}` },
    ]));
    await ctx.reply(`Hi there! We will be collecting attendance every week!
  \nSelect the respective worship experience.`, {
        reply_markup: inlineKeyboard,
    });
    await unshakeableAttendanceSpreadsheet.resetLocalCache();
};
/**
 * Handles the logic for the /sendclaim command.
 * This function is for user to send claims.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const sendClaim = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Make a claim',
                callback_data: 'makeClaim',
            },
        ],
        [
            {
                text: 'View Your Claims',
                callback_data: 'viewClaim',
            },
        ],
    ]);
    await ctx.reply(`<b>Unshakeable Finance Claims</b>\n\n<b>REMINDER</b>\nMake sure you inform the finance person before making any claims.`, {
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
    });
};
/**
 * Handles the logic for the /adminwelfare command.
 * This function is for admin to manage welfare events.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const adminWelfare = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const access = await _index_1.dbSecurity.roleAccess(['welfare', 'welfareIC', 'LGL', 'it', 'SGL'], ctx);
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
        await ctx.reply(`
	Welfare Team Admin Matters
	\nYou can view all wishes and send reminders for all welfare events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        await ctx.reply('AIYO! You are not serving in Welfare. Hence, you cant access this :(');
    }
};
/**
 * Handles the logic for the /adminbday command.
 * This function is for admin to manage birthday events.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const adminbday = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    // REMOVED ACCESS RESTRICTION
    // const access = await dbSecurity.roleAccess(
    //   ['bday', 'bdayIC', 'LGL', 'it'],
    //   ctx
    // );
    // if (access) {
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Manage Birthday Events',
                callback_data: 'manageBirthdayEvent',
            },
        ],
        // REMOVED ACCESS RESTRICTION
        // [
        //   {
        //     text: 'Manage Birthday Team',
        //     callback_data: 'manageBirthdayTeam',
        //   },
        // ],
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
    await ctx.reply(`
	Birthday Team Admin Matters

	\nYou can view all wishes and send reminders for all birthday events
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
        reply_markup: inlineKeyboard,
    });
    // REMOVED ACCESS RESTRICTION
    // } else {
    //   await ctx.reply(
    //     'AIYO! You are not serving in Birthday. Hence, you cant access this :('
    //   );
    // }
};
/**
 * Handles the logic for the /adminsf command.
 * This function is for admin to manage sermon feedback.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const adminsf = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const access = await _index_1.dbSecurity.roleAccess(['admin', 'adminIC', 'LGL', 'it', 'SGL'], ctx);
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
            [
                {
                    text: 'Manage Admin Team',
                    callback_data: 'manageAdminTeam',
                },
            ],
            [
                {
                    text: 'Exclude From Reminder',
                    callback_data: 'excludeFromReminder',
                },
            ],
        ]);
        await ctx.reply(`
	Admin Team Admin Matters

	\nYou can send reminders for sermon feedback
	\nDo exercise data confidentiality.
	\nDo also use the reminder system with proper responsibility.
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        await ctx.reply('AIYO! You are not serving in Admin. Hence, you cant access this :(');
    }
};
/**
 * Handles the logic for the /adminattendance command.
 * This function is for admin to manage attendance.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const adminattendance = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const access = await _index_1.dbSecurity.roleAccess(['SGL', 'LGL', 'it', 'admin', 'adminIC'], ctx);
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
        await ctx.reply(`
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
        await ctx.reply('AIYO! You are our LGL/SGL. Hence, you cant access this :(');
    }
};
/**
 * Handles the logic for the /adminfinance command.
 * This function is for admin to manage finance.
 * @param ctx The command context.
 * @returns Returns false if the command is not called in a private chat.
 */
const adminfinance = async (ctx) => {
    var _a;
    if (((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type) !== 'private') {
        return false;
    }
    const access = await _index_1.dbSecurity.roleAccess(['SGL', 'finance', 'LGL', 'it'], ctx);
    if (access) {
        if (!ctx.session.financeAccess) {
            await ctx.reply('Please enter password:');
            ctx.session.botOnType = 12;
        }
        else {
            ctx.update.message.text = process.env.FINANCE_PASSWORD || '';
            await _index_2.adminFinanceBotOn.adminFinanceMenu(ctx);
        }
    }
    else {
        await ctx.reply('No Access to Finance');
    }
};
