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
exports.withLG_noLG_2 = exports.withLG_noLG_1 = exports.withLG_yesLG = exports.noLG_no_2 = exports.noLG_no_1 = exports.noLG_yes = exports.sendAttendanceReply = void 0;
const _index_1 = require("../gsheets/_index");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const _gsheet_init_1 = require("../gsheets/_gsheet_init");
const _SessionData_1 = require("../models/_SessionData");
const sendAttendanceReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const callback = yield ctx.update.callback_query.data.substring('svcLGAttendance-'.length);
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    ctx.session.attendance = callback;
    yield sheet.loadCells('C3');
    const lgCell = yield sheet.getCellByA1('C3');
    if (lgCell.value == 'No LG') {
        const inlineKeyboard = [
            [
                {
                    text: 'Yes',
                    callback_data: 'yesWeAttendance',
                },
            ],
            [
                {
                    text: 'No',
                    callback_data: 'noWeAttendance',
                },
            ],
        ];
        yield ctx.reply(`${callback}\nThere is no LG this week\nAre you coming for Worship Experience?`, {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    }
    else if (lgCell.value == 'LG') {
        const inlineKeyboard = [
            [
                {
                    text: 'Yes',
                    callback_data: 'yesLGAttendance',
                },
            ],
            [
                {
                    text: 'No',
                    callback_data: 'noLGAttendance',
                },
            ],
        ];
        yield ctx.reply('Are you coming for LG?', {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    }
    else {
        yield ctx.reply('There is a technical error please feedback to your repsective leaders');
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendAttendanceReply = sendAttendanceReply;
const noLG_yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const user = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
        teleUser: ctx.update.callback_query.from.username,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
    yield sheet.loadCells();
    const weCell = yield sheet.getCellByA1(`F${user[0].attendanceRow}`);
    const lgCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
    const reasonCell = yield sheet.getCellByA1(`G${user[0].attendanceRow}`);
    const lgReasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
    weCell.value = 'Y';
    reasonCell.value = '';
    lgCell.value = ctx.session.eventName;
    lgReasonCell.value = ctx.session.text;
    yield sheet.saveUpdatedCells();
    yield ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.noLG_yes = noLG_yes;
const noLG_no_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('AW 😭.\nWhats the reason?', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 19;
});
exports.noLG_no_1 = noLG_no_1;
//botontype = 19;
const noLG_no_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const reason = (yield ctx.message.text) || '';
    const user = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
        teleUser: ctx.update.message.from.username,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
    yield sheet.loadCells();
    const weCell = yield sheet.getCellByA1(`F${user[0].attendanceRow}`);
    const lgCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
    const reasonCell = yield sheet.getCellByA1(`G${user[0].attendanceRow}`);
    const lgReasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
    weCell.value = 'N';
    reasonCell.value = reason;
    lgCell.value = ctx.session.eventName;
    lgReasonCell.value = ctx.session.text;
    yield sheet.saveUpdatedCells();
    yield ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.noLG_no_2 = noLG_no_2;
const withLG_yesLG = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = 'Y';
    const inlineKeyboard = [
        [
            {
                text: 'Yes',
                callback_data: 'yesWeAttendance',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'noWeAttendance',
            },
        ],
    ];
    yield ctx.reply('Nice!\nWill you be coming for Worship Experience?', {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
});
exports.withLG_yesLG = withLG_yesLG;
const withLG_noLG_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('AW 😭.\nWhats the reason?', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 20;
});
exports.withLG_noLG_1 = withLG_noLG_1;
//botontype = 20;
const withLG_noLG_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.text = (yield ctx.message.text) || '';
    ctx.session.eventName = 'N';
    const inlineKeyboard = [
        [
            {
                text: 'Yes',
                callback_data: 'yesWeAttendance',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'noWeAttendance',
            },
        ],
    ];
    yield ctx.reply(`${ctx.session.attendance}\nAre you coming for Worship Experience?`, {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
});
exports.withLG_noLG_2 = withLG_noLG_2;
