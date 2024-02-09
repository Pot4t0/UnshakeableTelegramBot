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
exports.settings = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _index_1 = require("../../gsheets/_index");
const _gsheet_init_1 = require("../../gsheets/_gsheet_init");
const _SessionData_1 = require("../../models/_SessionData");
const _index_2 = require("../../database_mongoDB/functions/_index");
// Settings Callbacks
// Any overall bot admin settings
const settings = (bot) => {
    bot.callbackQuery('settingsAnnouncements', _telefunctions_1.loadFunction, settingsAnnouncements_Write); //Settings Announcements Input
    bot.callbackQuery('settingsNewUser', _telefunctions_1.loadFunction, newUserManagement); //Settings New User Management
    //Settings Remove User Management
    bot.callbackQuery('settingsDeleteUser', _telefunctions_1.loadFunction, rmUserManagement);
    bot.callbackQuery(/^rmUser-/g, _telefunctions_1.loadFunction, rmUser);
    bot.callbackQuery(/^cfmRmUser-/g, _telefunctions_1.loadFunction, cfmRmUser);
    bot.callbackQuery('settingsLGGroup', _telefunctions_1.loadFunction, lgGroupManagement); //Settings Bot On
    //Settings Announcements Output is located in BotOnFunctions
    //Settings Leaders Team Management
    _index_2.team.teamManagement(bot, 'Leaders');
};
exports.settings = settings;
// Settings Announcements Input
const settingsAnnouncements_Write = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield ctx.reply(`Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 31;
});
// Settings New User Management
const newUserManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard().requestUser('Add User', 1).oneTime(true);
    yield ctx.reply('Click button to go to contact list', {
        reply_markup: button,
    });
});
// Settings Remove User Management
const rmUserManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const allNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(allNames.map((n) => [
        {
            text: n.nameText,
            callback_data: `rmUser-${n.nameText}`,
        },
    ]));
    yield ctx.reply('Click user to remove', {
        reply_markup: inlineKeyboard,
    });
});
const rmUser = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const user = yield ctx.update.callback_query.data.substring('rmUser-'.length);
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
    yield ctx.reply(`Are you sure you want to remove ${user}?`, {
        reply_markup: inlineKeyboard,
    });
});
const cfmRmUser = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const cfm = yield ctx.update.callback_query.data.substring('cfmRmUser-'.length);
    const user = ctx.session.name;
    if (user) {
        if (cfm == 'Yes') {
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
            const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
            const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
            const userDoc = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
                nameText: user,
            });
            if (userDoc) {
                const userRow = userDoc.attendanceRow;
                yield template.loadCells();
                const numberCell = template.getCellByA1(`A${userRow}`);
                const nameCell = template.getCellByA1(`B${userRow}`);
                numberCell.value = '';
                nameCell.value = '';
                yield template.saveUpdatedCells();
                yield special_template.loadCells();
                const special_numberCell = special_template.getCellByA1(`A${userRow}`);
                const special_nameCell = special_template.getCellByA1(`B${userRow}`);
                special_numberCell.value = '';
                special_nameCell.value = '';
                yield special_template.saveUpdatedCells();
                yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).delete({ nameText: user });
                yield ctx.reply(`${user} has been removed`);
                //Change the attendance row of all users below the deleted user
                const allUsers = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
                allUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
                    if (n.attendanceRow > userRow) {
                        const userRow = n.attendanceRow - 1;
                        const name = n.nameText;
                        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).update({ nameText: name }, { attendanceRow: userRow });
                        yield template.loadCells();
                        const numberCell = template.getCellByA1(`A${userRow}`);
                        const nameCell = template.getCellByA1(`B${userRow}`);
                        numberCell.value = userRow - 3;
                        nameCell.value = name;
                        yield template.saveUpdatedCells();
                        yield special_template.loadCells();
                        const special_numberCell = special_template.getCellByA1(`A${userRow}`);
                        const special_nameCell = special_template.getCellByA1(`B${userRow}`);
                        special_numberCell.value = userRow - 3;
                        special_nameCell.value = name;
                        yield special_template.saveUpdatedCells();
                    }
                }));
                yield ctx.reply("All user's attendance row has been updated. Please check the Google Sheet!");
                _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                ctx.session = (0, _SessionData_1.initial)();
            }
            else {
                yield ctx.reply(`Deletion failed! Could not get ${user}`);
            }
        }
        else {
            yield ctx.reply(`Deletion Cancelled`);
        }
    }
});
// Settings LG Group Change Management
const lgGroupManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard().requestChat('Choose LG Chat', 1).oneTime(true);
    yield ctx.reply(`Choose the updated LG Chat. It will let the Bot enter the chat and send messages.
    `, {
        reply_markup: button,
    });
});
