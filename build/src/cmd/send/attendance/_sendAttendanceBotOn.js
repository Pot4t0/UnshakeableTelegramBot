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
exports.dinnerAttendanceReason = exports.SpecialAttendanceLogReason = exports.lgAttendanceLogReason = exports.WeAttendanceLogReason = void 0;
const _index_1 = require("../../../gsheets/_index");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _sendAttendanceInternal_1 = require("./_sendAttendanceInternal");
// WE Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 19
// Logs Reason Message to Google Sheets
const WeAttendanceLogReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const reason = yield ctx.message.text;
    if (reason == null) {
        (0, exports.WeAttendanceLogReason)(ctx);
    }
    yield ctx.reply('Processing... Please wait...');
    try {
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            yield sheet.saveUpdatedCells();
            const meal = ctx.session.eventMeal;
            if (meal) {
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
                yield ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
                    reply_markup: { inline_keyboard: inlineKeyboard },
                });
            }
            else {
                yield ctx.reply('Error! Pls try again');
                ctx.session = yield (0, _SessionData_1.initial)();
                yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            }
        }
    }
    catch (err) {
        yield ctx.reply('Could not log reason! Please try again!');
        console.log(err);
        ctx.session = (0, _SessionData_1.initial)();
        _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
exports.WeAttendanceLogReason = WeAttendanceLogReason;
// LG Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 20
// Logs Reason Message to Google Sheets
const lgAttendanceLogReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.lgAttendanceLogReason)(ctx);
    }
    yield ctx.reply('Processing... Please wait...');
    try {
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield sheet.loadCells();
            const attendanceCell = yield sheet.getCellByA1(`F${user[0].attendanceRow}`);
            const reasonCell = yield sheet.getCellByA1(`G${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            yield sheet.saveUpdatedCells();
            yield ctx.reply('Attendance logged! Thanks for submitting!');
        }
        else {
            yield ctx.reply('Error! Pls try again');
        }
    }
    catch (err) {
        yield ctx.reply('Could not log reason! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.lgAttendanceLogReason = lgAttendanceLogReason;
// Special Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 28
// Logs Reason Message to Google Sheets
const SpecialAttendanceLogReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    yield ctx.reply('Processing... Please wait...');
    try {
        if (reason == null) {
            (0, exports.SpecialAttendanceLogReason)(ctx);
        }
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            yield sheet.saveUpdatedCells();
            const meal = ctx.session.eventMeal;
            if (meal) {
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
                yield ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
                    reply_markup: { inline_keyboard: inlineKeyboard },
                });
            }
            else {
                yield ctx.reply('Attendance logged! Thanks for submitting!');
                ctx.session = (0, _SessionData_1.initial)();
                _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            }
        }
    }
    catch (err) {
        yield ctx.reply('Could not log reason! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.SpecialAttendanceLogReason = SpecialAttendanceLogReason;
// Dinner Attendance Reason Function
// Used in _botOn_functions.ts in botOntype = 29
// Logs Reason Message to Google Sheets (Special/ No LG Event)
// Proceeds to move to LG Attendance Function (LG Event)
const dinnerAttendanceReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.dinnerAttendanceReason)(ctx);
    }
    else {
        yield ctx.reply('Processing... Please wait...');
        try {
            const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                teleUser: ctx.update.message.from.username,
            });
            switch (ctx.session.eventName) {
                case 'Special Event':
                    yield (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
                    yield ctx.reply('Attendance logged! Thanks for submitting!');
                    ctx.session = (0, _SessionData_1.initial)();
                    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                    break;
                case 'No LG':
                    yield (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
                    yield ctx.reply('Attendance logged! Thanks for submitting!');
                    ctx.session = (0, _SessionData_1.initial)();
                    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                    break;
                case 'LG':
                    yield (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
                    const sheet = ctx.session.gSheet;
                    if (sheet) {
                        const lgDateCell = sheet.getCellByA1('F2');
                        const inlineKeyboard = [
                            [
                                {
                                    text: 'Yes',
                                    callback_data: 'lgAttendance-Y',
                                },
                            ],
                            [
                                {
                                    text: 'No',
                                    callback_data: 'lgAttendance-N',
                                },
                            ],
                        ];
                        yield ctx.reply(`Are you coming for LG? on the ${lgDateCell.value}`, {
                            reply_markup: { inline_keyboard: inlineKeyboard },
                        });
                    }
                    break;
                default:
                    yield ctx.reply('Error! Pls try again');
                    ctx.session = (0, _SessionData_1.initial)();
                    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            }
        }
        catch (err) {
            yield ctx.reply('Could not log reason! Please try again!');
            console.log(err);
            ctx.session = (0, _SessionData_1.initial)();
            _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
    }
});
exports.dinnerAttendanceReason = dinnerAttendanceReason;
