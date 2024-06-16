"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser_FullName = exports.addUser = exports.settingsAnnouncements_Send = void 0;
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _initialise_1 = require("../../functions/_initialise");
/**
 * Sends an announcement to all users.
 * @param ctx The message context.
 * Used in _botOn_functions.ts
 * Refer to case botOntype = 31
 */
const settingsAnnouncements_Send = async (ctx) => {
    const announcement = '<b>Bot Announcement:</b>\n' + ctx.message.text;
    if (announcement == null || ctx.session.botOnType == null) {
        (0, exports.settingsAnnouncements_Send)(ctx);
    }
    else {
        const allNames = _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
        const sendUsersChatId = (await allNames)
            .map((n) => n.chat)
            .filter((n) => n != '');
        const sendUsers = (await allNames)
            .map((n) => n.teleUser)
            .filter((n) => n != '');
        await Promise.all(sendUsers.map(async (n) => {
            const chatId = await sendUsersChatId[sendUsers.indexOf(n)];
            const sentMsg = await _index_1.dbMessaging.sendMessageUser(n, announcement, ctx);
            try {
                if (sentMsg) {
                    await ctx.api.pinChatMessage(chatId, sentMsg.message_id);
                }
                else {
                    await ctx.reply('Error in sending message');
                    console.log('Error in sending message');
                }
            }
            catch (err) {
                console.log(err);
            }
            console.log(announcement + `(${n})`);
        }));
        await ctx.reply(`Announcement sent!`);
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.settingsAnnouncements_Send = settingsAnnouncements_Send;
/**
 * Adds a user to the database.
 * This function prompts the user to input the full name of the new user.
 * @param ctx The message context.
 * Used in _botOn_functions.ts
 * Refer to case user_shared = 1
 */
const addUser = async (ctx) => {
    var _a;
    const chatid = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.user_shared.user_id;
    if (chatid) {
        await ctx.reply(`User ID: ${chatid}, Please write down the full name of user:`, { reply_markup: { force_reply: true } });
    }
    else {
        await ctx.reply('Error! Please try again!');
    }
    ctx.session.chatId = chatid;
    ctx.session.botOnType = 32;
};
exports.addUser = addUser;
/**
 * Adds the new user to the database and Google Sheets.
 * Used in _botOn_functions.ts
 * Refer to case botOntype = 32
 * @param ctx The message context.
 */
const addUser_FullName = async (ctx) => {
    const fullName = ctx.message.text;
    const chatId = ctx.session.chatId;
    if (fullName && chatId) {
        const currentNames = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
        let nameExist = false;
        currentNames.map(async (n) => {
            if (n.nameText == fullName || n.chat == chatId.toString()) {
                nameExist = true;
            }
        });
        if (!nameExist) {
            const allNames = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
            const attendanceRow = allNames.map((n) => n.attendanceRow);
            const highestAttendnaceRow = Math.max(...attendanceRow) + 1;
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).save({
                nameText: fullName,
                chat: chatId.toString(),
                role: [],
                teleUser: '',
                attendanceRow: highestAttendnaceRow,
            });
            const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
            const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
            const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
            await template.loadCells();
            const numberCell = template.getCellByA1(`A${highestAttendnaceRow}`);
            const nameCell = template.getCellByA1(`B${highestAttendnaceRow}`);
            numberCell.value = highestAttendnaceRow - 3;
            nameCell.value = fullName;
            await template.saveUpdatedCells();
            await special_template.loadCells();
            const special_numberCell = special_template.getCellByA1(`A${highestAttendnaceRow}`);
            const special_nameCell = special_template.getCellByA1(`B${highestAttendnaceRow}`);
            special_numberCell.value = highestAttendnaceRow - 3;
            special_nameCell.value = fullName;
            await special_template.saveUpdatedCells();
            await ctx.reply(`${fullName} added! Please change sermon feedback Google sheet accoridngly!\n\nName: ${fullName}\nChat ID: ${chatId}\nAttendance Row: ${highestAttendnaceRow}\n`);
            unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
        else {
            await ctx.reply('User already exists!');
        }
        ctx.session = (0, _SessionData_1.initial)();
    }
    else {
        await ctx.reply('Error! Please try again!');
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.addUser_FullName = addUser_FullName;
