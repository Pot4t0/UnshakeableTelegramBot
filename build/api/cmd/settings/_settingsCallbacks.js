"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _initialise_1 = require("../../functions/_initialise");
// Settings Callbacks
// Any overall bot admin settings
const settings = (bot) => {
    bot.callbackQuery('settingsAnnouncements', _telefunctions_1.loadFunction, settingsAnnouncements_Write); //Settings Announcements Input
    bot.callbackQuery('settingsNewUser', _telefunctions_1.loadFunction, newUserManagement); //Settings New User Management
    //Settings Remove User Management
    bot.callbackQuery('settingsDeleteUser', _telefunctions_1.loadFunction, rmUserManagement);
    bot.callbackQuery(/^rmUser-/g, _telefunctions_1.loadFunction, rmUser);
    bot.callbackQuery(/^cfmRmUser-/g, _telefunctions_1.loadFunction, cfmRmUser);
    // bot.callbackQuery('settingsLGGroup', loadFunction, lgGroupManagement); //Settings Bot On
    //Settings Announcements Output is located in BotOnFunctions
    _index_1.chat.chooseChat(bot, 'LG');
    //Settings Leaders Team Management
    _index_1.team.teamManagement(bot, 'Leaders');
    //Settings Chanage Google Sheet
    _index_1.gSheetDB.chooseSheet(bot);
};
exports.settings = settings;
// Settings Announcements Input
const settingsAnnouncements_Write = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply(`Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 31;
};
// Settings New User Management
const newUserManagement = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard().requestUser('Add User', 1).oneTime(true);
    await ctx.reply('Click button to go to contact list', {
        reply_markup: button,
    });
};
// Settings Remove User Management
const rmUserManagement = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const allNames = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(allNames.map((n) => [
        {
            text: n.nameText,
            callback_data: `rmUser-${n.nameText}`,
        },
    ]));
    await ctx.reply('Click user to remove', {
        reply_markup: inlineKeyboard,
    });
};
const rmUser = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const user = await ctx.update.callback_query.data.substring('rmUser-'.length);
    ctx.session.name = user;
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Yes',
                callback_data: `cfmRmUser-Yes`,
            },
            {
                text: 'No',
                callback_data: `cfmRmUser-No`,
            },
        ],
    ]);
    await ctx.reply(`Are you sure you want to remove ${user}?`, {
        reply_markup: inlineKeyboard,
    });
};
const cfmRmUser = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const cfm = await ctx.update.callback_query.data.substring('cfmRmUser-'.length);
    const user = ctx.session.name;
    if (user) {
        if (cfm == 'Yes') {
            const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
            const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
            const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
            const userDoc = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
                nameText: user,
            });
            if (userDoc) {
                const userRow = userDoc.attendanceRow;
                await template.loadCells();
                const numberCell = template.getCellByA1(`A${userRow}`);
                const nameCell = template.getCellByA1(`B${userRow}`);
                numberCell.value = '';
                nameCell.value = '';
                await template.saveUpdatedCells();
                await special_template.loadCells();
                const special_numberCell = special_template.getCellByA1(`A${userRow}`);
                const special_nameCell = special_template.getCellByA1(`B${userRow}`);
                special_numberCell.value = '';
                special_nameCell.value = '';
                await special_template.saveUpdatedCells();
                await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).delete({ nameText: user });
                await ctx.reply(`${user} has been removed`);
                //Change the attendance row of all users below the deleted user
                const allUsers = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
                allUsers.map(async (n) => {
                    if (n.attendanceRow > userRow) {
                        const userRow = n.attendanceRow - 1;
                        const name = n.nameText;
                        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).update({ nameText: name }, { attendanceRow: userRow });
                        await template.loadCells();
                        const numberCell = template.getCellByA1(`A${userRow}`);
                        const nameCell = template.getCellByA1(`B${userRow}`);
                        numberCell.value = userRow - 3;
                        nameCell.value = name;
                        await template.saveUpdatedCells();
                        await special_template.loadCells();
                        const special_numberCell = special_template.getCellByA1(`A${userRow}`);
                        const special_nameCell = special_template.getCellByA1(`B${userRow}`);
                        special_numberCell.value = userRow - 3;
                        special_nameCell.value = name;
                        await special_template.saveUpdatedCells();
                    }
                });
                await ctx.reply("All user's attendance row has been updated. Please check the Google Sheet!");
                unshakeableAttendanceSpreadsheet.resetLocalCache();
                ctx.session = (0, _SessionData_1.initial)();
            }
            else {
                await ctx.reply(`Deletion failed! Could not get ${user}`);
            }
        }
        else {
            await ctx.reply(`Deletion Cancelled`);
        }
    }
};
