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
exports.changeLGChat = exports.addUser_FullName = exports.addUser = exports.settingsAnnouncements_Send = void 0;
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _index_2 = require("../../gsheets/_index");
const _gsheet_init_1 = require("../../gsheets/_gsheet_init");
// Settings Announcements Output
// Used in _botOn_functions.ts
// Refer to case botOntype = 31
const settingsAnnouncements_Send = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const announcement = '<b>Bot Announcement:</b>\n' + ctx.message.text;
    if (announcement == null || ctx.session.botOnType == null) {
        (0, exports.settingsAnnouncements_Send)(ctx);
    }
    else {
        const allNames = _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
        const sendUsers = (yield allNames)
            .map((n) => n.teleUser)
            .filter((n) => n != '');
        yield Promise.all(sendUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const sentMsg = yield _index_1.dbMessaging.sendMessageUser(n, announcement, ctx);
            try {
                yield ctx.api.pinChatMessage(sentMsg.chat.id, sentMsg.message_id);
            }
            catch (err) {
                console.log(err);
            }
            console.log(announcement + `(${n})`);
        })));
        yield ctx.reply(`Announcement sent!`);
        ctx.session = (0, _SessionData_1.initial)();
    }
});
exports.settingsAnnouncements_Send = settingsAnnouncements_Send;
// Settings Add User
// Full Name of New User
// Used in _botOn_functions.ts
// Refer to user_shared case 1
const addUser = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatid = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.user_shared.user_id;
    if (chatid) {
        yield ctx.reply('Processing... Please wait...');
        yield ctx.reply(`User ID: ${chatid}, Please write down the full name of user:`, { reply_markup: { force_reply: true } });
    }
    else {
        yield ctx.reply('Error! Please try again!');
    }
    ctx.session.chatId = chatid;
    ctx.session.botOnType = 32;
});
exports.addUser = addUser;
// Settings Add User
// Full Name of New User
// Used in _botOn_functions.ts
// Refer to case botOntype = 32
const addUser_FullName = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const fullName = ctx.message.text;
    const chatId = ctx.session.chatId;
    yield ctx.reply('Processing... Please wait...');
    if (fullName && chatId) {
        const currentNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
        let nameExist = false;
        currentNames.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            if (n.nameText == fullName || n.chat == chatId.toString()) {
                nameExist = true;
            }
        }));
        if (!nameExist) {
            const allNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
            const attendanceRow = allNames.map((n) => n.attendanceRow);
            const highestAttendnaceRow = Math.max(...attendanceRow) + 1;
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).save({
                nameText: fullName,
                chat: chatId.toString(),
                role: [],
                teleUser: '',
                attendanceRow: highestAttendnaceRow,
            });
            yield _index_2.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
            const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
            const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
            yield template.loadCells();
            const numberCell = template.getCellByA1(`A${highestAttendnaceRow}`);
            const nameCell = template.getCellByA1(`B${highestAttendnaceRow}`);
            numberCell.value = highestAttendnaceRow - 3;
            nameCell.value = fullName;
            yield template.saveUpdatedCells();
            yield special_template.loadCells();
            const special_numberCell = special_template.getCellByA1(`A${highestAttendnaceRow}`);
            const special_nameCell = special_template.getCellByA1(`B${highestAttendnaceRow}`);
            special_numberCell.value = highestAttendnaceRow - 3;
            special_nameCell.value = fullName;
            yield special_template.saveUpdatedCells();
            yield ctx.reply(`${fullName} added! Please change sermon feedback Google sheet accoridngly!\n\nName: ${fullName}\nChat ID: ${chatId}\nAttendance Row: ${highestAttendnaceRow}\n`);
        }
        else {
            yield ctx.reply('User already exists!');
        }
        _index_2.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        ctx.session = (0, _SessionData_1.initial)();
    }
    else {
        yield ctx.reply('Error! Please try again!');
        ctx.session = (0, _SessionData_1.initial)();
    }
});
exports.addUser_FullName = addUser_FullName;
// Settings Change LG Chat
// Used in _botOn_functions.ts
// Refer to user_shared case 2
const changeLGChat = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const chatid = (_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.chat_shared.chat_id;
    yield ctx.reply('Processing... Please wait...');
    if (chatid) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'LG' }, { $set: { config: [chatid.toString()] } });
        yield ctx.reply(`LG Chat changed to ${chatid} Remember to add bot to the chat!`);
    }
    else {
        yield ctx.reply('Error! Please try again!');
    }
});
exports.changeLGChat = changeLGChat;
