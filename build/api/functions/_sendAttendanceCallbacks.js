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
exports.dinnerAttendanceReason = exports.dinnerAttendance = exports.withLG_noLG_2 = exports.withLG_noLG_1 = exports.withLG_yesLG = exports.noLG_no_2 = exports.noLG_no_1 = exports.noLG_yes = exports.noSpecialAttendance_2 = exports.noSpecialAttendance_1 = exports.yesSpecialAttendance = exports.sendAttendanceReply = void 0;
const _index_1 = require("../gsheets/_index");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _gsheet_init_1 = require("../gsheets/_gsheet_init");
const _SessionData_1 = require("../models/_SessionData");
const sendAttendanceReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const callback = yield ctx.update.callback_query.data.substring('svcLGAttendance-'.length);
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    ctx.session.attendance = yield callback;
    yield sheet.loadCells();
    const lgCell = yield sheet.getCellByA1('C3');
    const lgDateCell = yield sheet.getCellByA1('C2');
    const weDateCell = yield sheet.getCellByA1('F2');
    const checkSpecialCell = yield sheet.getCellByA1('B2');
    if (checkSpecialCell.value == 'Special Event') {
        const inlineKeyboard = [
            [
                {
                    text: 'Yes',
                    callback_data: 'yesSpecialAttendance',
                },
            ],
            [
                {
                    text: 'No',
                    callback_data: 'noSpecialAttendance',
                },
            ],
        ];
        yield ctx.reply(`Hi we will be having ${lgCell.value} on ${lgDateCell.value}. Will you be attending?`, {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    }
    else {
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
            yield ctx.reply(`There is no LG this week\nAre you coming for Worship Experience on ${weDateCell.value}?`, {
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
            yield ctx.reply(`Are you coming for LG on ${lgDateCell.value}?`, {
                reply_markup: { inline_keyboard: inlineKeyboard },
            });
        }
        else {
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
            yield ctx.reply(`Are you coming for ${lgCell.value} on ${lgDateCell.value}?`, {
                reply_markup: { inline_keyboard: inlineKeyboard },
            });
        }
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendAttendanceReply = sendAttendanceReply;
const yesSpecialAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.callback_query.from.username,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
    yield sheet.loadCells();
    const attendanceCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
    const reasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
    reasonCell.value = '';
    attendanceCell.value = 'Y';
    yield sheet.saveUpdatedCells();
    yield ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.yesSpecialAttendance = yesSpecialAttendance;
const noSpecialAttendance_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('AW 😭.\nWhats the reason?', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 28;
});
exports.noSpecialAttendance_1 = noSpecialAttendance_1;
//botontype = 28
const noSpecialAttendance_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const reason = (yield ctx.message.text) || '';
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.message.from.username,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
    yield sheet.loadCells();
    const attendanceCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
    const reasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
    attendanceCell.value = 'N';
    reasonCell.value = reason;
    yield sheet.saveUpdatedCells();
    yield ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.noSpecialAttendance_2 = noSpecialAttendance_2;
const noLG_yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.weAttendance = yield 'Y';
    ctx.session.weReason = yield '';
    const inlineKeyboard = [
        [
            {
                text: 'Yes',
                callback_data: 'dinnerAttendance-Y',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'dinnerAttendance-N',
            },
        ],
    ];
    yield ctx.reply('Nice!\nAre you coming for dinner?', {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
    //   const user = await Database.getMongoRepository(Names).find({
    //     teleUser: ctx.update.callback_query.from.username,
    //   });
    //   await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    //   const sheet =
    //     await unshakeableAttendanceSpreadsheet.sheetsByTitle[
    //       ctx.session.attendance || ''
    //     ];
    //   await sheet.loadCells();
    //   const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
    //   const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
    //   const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
    //   const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
    //   weCell.value = 'Y';
    //   reasonCell.value = '';
    //   lgCell.value = ctx.session.eventName;
    //   lgReasonCell.value = ctx.session.text;
    //   await sheet.saveUpdatedCells();
    //   await ctx.reply('Attendance logged! Thanks for submitting!');
    //   ctx.session = await initial();
    //   await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
    ctx.session.weReason = (yield ctx.message.text) || '';
    ctx.session.weAttendance = yield 'N';
    const inlineKeyboard = [
        [
            {
                text: 'Yes',
                callback_data: 'dinnerAttendance-Y',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'dinnerAttendance-N',
            },
        ],
    ];
    yield ctx.reply('Are you coming for dinner?', {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
    // const user = await Database.getMongoRepository(Names).find({
    //   teleUser: ctx.update.message.from.username,
    // });
    // await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    // const sheet =
    //   await unshakeableAttendanceSpreadsheet.sheetsByTitle[
    //     ctx.session.attendance || ''
    //   ];
    // await sheet.loadCells();
    // const weCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
    // const lgCell = await sheet.getCellByA1(`C${user[0].attendanceRow}`);
    // const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
    // const lgReasonCell = await sheet.getCellByA1(`D${user[0].attendanceRow}`);
    // weCell.value = 'N';
    // reasonCell.value = reason;
    // lgCell.value = ctx.session.eventName;
    // lgReasonCell.value = ctx.session.text;
    // await sheet.saveUpdatedCells();
    // await ctx.reply('Attendance logged! Thanks for submitting!');
    // ctx.session = await initial();
    // await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.noLG_no_2 = noLG_no_2;
const withLG_yesLG = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = 'Y';
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const callback = ctx.session.attendance || '';
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    ctx.session.attendance = callback;
    yield sheet.loadCells('F2');
    const weDate = yield sheet.getCellByA1('F2');
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
    yield ctx.reply(`Nice!\nWill you be coming for Worship Experience on ${weDate.value}?`, {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const callback = ctx.session.attendance || '';
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    ctx.session.attendance = callback;
    yield sheet.loadCells('F2');
    const weDate = yield sheet.getCellByA1('F2');
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
    yield ctx.reply(`Are you coming for Worship Experience on ${weDate.value}?`, {
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.withLG_noLG_2 = withLG_noLG_2;
const dinnerAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('dinnerAttendance-'.length);
    if (callback == 'Y') {
        yield ctx.reply('Y');
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.callback_query.from.username,
        });
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
        yield ctx.reply('1');
        yield sheet.loadCells();
        const weCell = yield sheet.getCellByA1(`F${user[0].attendanceRow}`);
        const lgCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
        const reasonCell = yield sheet.getCellByA1(`G${user[0].attendanceRow}`);
        const lgReasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
        const dinnerCell = yield sheet.getCellByA1(`I${user[0].attendanceRow}`);
        const dinnerReasonCell = yield sheet.getCellByA1(`J${user[0].attendanceRow}`);
        yield ctx.reply('2');
        weCell.value = ctx.session.weAttendance;
        reasonCell.value = ctx.session.weReason;
        lgCell.value = ctx.session.eventName;
        lgReasonCell.value = ctx.session.text;
        dinnerCell.value = 'Y';
        dinnerReasonCell.value = '';
        yield sheet.saveUpdatedCells();
        yield ctx.reply('Attendance logged! Thanks for submitting!');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
    else if (callback == 'N') {
        yield ctx.reply('AW 😭.\nWhats the reason?', {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = 28;
    }
    else {
        yield ctx.reply('Error! Pls try again');
    }
});
exports.dinnerAttendance = dinnerAttendance;
const dinnerAttendanceReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const reason = (yield ctx.message.text) || '';
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.message.from.username,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.attendance || ''];
    yield sheet.loadCells();
    const weCell = yield sheet.getCellByA1(`F${user[0].attendanceRow}`);
    const lgCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
    const reasonCell = yield sheet.getCellByA1(`G${user[0].attendanceRow}`);
    const lgReasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
    const dinnerCell = yield sheet.getCellByA1(`I${user[0].attendanceRow}`);
    const dinnerReasonCell = yield sheet.getCellByA1(`J${user[0].attendanceRow}`);
    weCell.value = ctx.session.weAttendance;
    reasonCell.value = ctx.session.weReason;
    lgCell.value = ctx.session.eventName;
    lgReasonCell.value = ctx.session.text;
    dinnerCell.value = 'N';
    dinnerReasonCell.value = reason;
    yield sheet.saveUpdatedCells();
    yield ctx.reply('Attendance logged! Thanks for submitting!');
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.dinnerAttendanceReason = dinnerAttendanceReason;
