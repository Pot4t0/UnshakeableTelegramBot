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
exports.sendAttendance = void 0;
const _index_1 = require("../../../gsheets/_index");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _gsheet_init_1 = require("../../../gsheets/_gsheet_init");
const _SessionData_1 = require("../../../models/_SessionData");
const _sendAttendanceInternal_1 = require("./_sendAttendanceInternal");
const _telefunctions_1 = require("../../../app/_telefunctions");
//Send Attendance Callbacks
// For Special Event
// Take Event Attendance (Yes/No) -> Take Reason (If no) -> Take Meal Attendance (if Have) -> Take Reason (if no) -> Log Attendance
// For No LG Event
// Take WE Attendance (Yes/No) -> Take Reason (If no) -> Take Dinner Attendance (if Have) -> Take Reason (if no) -> Log Attendance
// For LG Event
// Take WE Attendance (Yes/No) -> Take Reason (If no) -> Take Dinner Attendance (if Have) -> Take Reason (if no) -> Take LG Attendance (Yes/No) -> Take Reason (if no) -> Log Attendance
const sendAttendance = (bot) => {
    bot.callbackQuery(/^svcLGAttendance/g, attendanceEventDecision);
    bot.callbackQuery(/^WeAttendance/g, WeAttendance);
    bot.callbackQuery(/^lgAttendance/g, lgAttendance);
    // Special Event
    bot.callbackQuery(/^SpecialAttendance-/g, SpecialAttendance);
    // Dinner/Meal Function
    bot.callbackQuery(/^dinnerAttendance-/g, dinnerAttendance);
};
exports.sendAttendance = sendAttendance;
// Attendance Event Decision Function
// Choose which attendance event message to send based on sheet data
const attendanceEventDecision = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const callback = ctx.update.callback_query.data.substring('svcLGAttendance-'.length);
    const sheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.loadCells();
    // Sesssion Data for Special Attendance
    // Google Sheet Event Object (ctx.session.gsheet)
    // Google Sheet Event Name (ctx.session.eventName)
    ctx.session.attendance = callback;
    ctx.session.gSheet = sheet;
    const eventCell = sheet.getCellByA1('C3');
    const eventDateCell = sheet.getCellByA1('C2');
    const lgCell = sheet.getCellByA1('F3');
    const checkSpecialCell = sheet.getCellByA1('B2');
    // Special Event
    // If Sheet contains "Special Event" at cell B2 then, it will send special event attendance message
    if (checkSpecialCell.value == 'Special Event') {
        ctx.session.eventName = 'Special Event';
        ctx.session.eventMeal = sheet.getCellByA1('F3').stringValue;
        console.log(ctx.session.eventMeal);
        const inlineKeyboard = [
            [
                {
                    text: 'Yes',
                    callback_data: 'SpecialAttendance-Y',
                },
            ],
            [
                {
                    text: 'No',
                    callback_data: 'SpecialAttendance-N',
                },
            ],
        ];
        yield ctx.reply(`Hi we will be having ${eventCell.value} on ${eventDateCell.value}. Will you be attending?`, {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
        console.log('Special Event');
    }
    else {
        // No LG Event
        // If Sheet contains "No LG" at cell C3 then, it will send no LG attendance message
        if (lgCell.value == 'No LG') {
            ctx.session.eventName = 'No LG';
            ctx.session.eventMeal = yield sheet.getCellByA1('I3').stringValue;
            const inlineKeyboard = [
                [
                    {
                        text: 'Yes',
                        callback_data: 'WeAttendance-Y',
                    },
                ],
                [
                    {
                        text: 'No',
                        callback_data: 'WeAttendance-N',
                    },
                ],
            ];
            yield ctx.reply(`There is no LG this week\nAre you coming for Worship Experience on ${eventDateCell.value}?`, {
                reply_markup: { inline_keyboard: inlineKeyboard },
            });
            console.log('No LG');
            // LG Event
            // If Sheet contains "LG" at cell C3 then, it will send LG attendance message
        }
        else if (lgCell.value == 'LG') {
            ctx.session.eventName = 'LG';
            ctx.session.eventMeal = yield sheet.getCellByA1('I3').stringValue;
            const inlineKeyboard = [
                [
                    {
                        text: 'Yes',
                        callback_data: 'WeAttendance-Y',
                    },
                ],
                [
                    {
                        text: 'No',
                        callback_data: 'WeAttendance-N',
                    },
                ],
            ];
            yield ctx.reply(`Are you coming for Worship Experience on ${eventDateCell.value}?`, {
                reply_markup: { inline_keyboard: inlineKeyboard },
            });
            console.log('LG');
            // Error Event
            // If Sheet contains anything else at cell C3 then, it will send error message
        }
        else {
            yield ctx.reply('Error! Pls try again');
            ctx.session = yield (0, _SessionData_1.initial)();
            console.log('Error Event');
        }
    }
});
// Special Event Attendance Logging Function
const SpecialAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('SpecialAttendance-'.length);
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.callback_query.from.username,
    });
    if (callback == 'Y') {
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield ctx.reply('Processing... Please wait...');
            yield sheet.loadCells();
            const attendanceCell = yield sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = yield sheet.getCellByA1(`D${user[0].attendanceRow}`);
            reasonCell.value = '';
            attendanceCell.value = 'Y';
            yield sheet.saveUpdatedCells();
            const meal = ctx.session.eventMeal;
            if (meal) {
                console.log('Special Event Meal');
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
                ctx.session = yield (0, _SessionData_1.initial)();
                _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            }
        }
    }
    else if (callback == 'N') {
        ctx.session.attendance;
        // Not Coming for Special Event
        yield ctx.reply('AW 😭.\nWhats the reason?', {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _sendAttendanceInternal_1.logReasonBotOnSpecial;
    }
    else {
        yield ctx.reply('Error! Pls try again');
        ctx.session = yield (0, _SessionData_1.initial)();
        _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
// WE Attendance Logging Function
const WeAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('WeAttendance-'.length);
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.callback_query.from.username,
    });
    if (callback == 'Y') {
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield ctx.reply('Processing... Please wait...');
            yield sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
            reasonCell.value = '';
            attendanceCell.value = 'Y';
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
                yield ctx.reply(`Nice! Are you coming for ${meal.toLowerCase()}?`, {
                    reply_markup: { inline_keyboard: inlineKeyboard },
                });
            }
        }
    }
    else if (callback == 'N') {
        ctx.session.attendance;
        // Not Coming for WE
        yield ctx.reply('AW 😭.\nWhats the reason?', {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _sendAttendanceInternal_1.logReasonBotOnWE;
    }
    else {
        yield ctx.reply('Error! Pls try again');
        ctx.session = (0, _SessionData_1.initial)();
        _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
// LG Attendance Logging Function
const lgAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('lgAttendance-'.length);
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.callback_query.from.username,
    });
    if (callback == 'Y') {
        const sheet = ctx.session.gSheet;
        if (sheet) {
            yield ctx.reply('Processing... Please wait...');
            yield sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`F${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`G${user[0].attendanceRow}`);
            reasonCell.value = '';
            attendanceCell.value = 'Y';
            yield sheet.saveUpdatedCells();
            yield ctx.reply('Attendance logged! Thanks for submitting!');
            ctx.session = (0, _SessionData_1.initial)();
            _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
    }
    else if (callback == 'N') {
        ctx.session.attendance;
        // Not Coming for LG
        yield ctx.reply('AW 😭.\nWhats the reason?', {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _sendAttendanceInternal_1.logReasonBotOnLG;
    }
    else {
        yield ctx.reply('Error! Pls try again');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
// Dinner Attendance Function
// Logs Dinner Attendance to Google Sheets (Special/ No LG Event)
// Proceeds to move to LG Attendance Function (LG Event)
// If Attendance is No, it will proceed to Dinner Attendance Reason Function at botOnType = 29
const dinnerAttendance = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('dinnerAttendance-'.length);
    if (callback == 'Y') {
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.callback_query.from.username,
        });
        switch (ctx.session.eventName) {
            case 'Special Event':
                dinnerLogAttendance(ctx, user[0].attendanceRow, ctx.session.eventName, 'Y', '');
                yield ctx.reply('Attendance logged! Thanks for submitting!');
                ctx.session = yield (0, _SessionData_1.initial)();
                yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                break;
            case 'No LG':
                dinnerLogAttendance(ctx, user[0].attendanceRow, ctx.session.eventName, 'Y', '');
                yield ctx.reply('Attendance logged! Thanks for submitting!');
                ctx.session = yield (0, _SessionData_1.initial)();
                yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
                break;
            case 'LG':
                dinnerLogAttendance(ctx, user[0].attendanceRow, ctx.session.eventName, 'Y', '');
                const sheet = ctx.session.gSheet;
                if (sheet) {
                    const lgDateCell = yield sheet.getCellByA1('F2');
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
                ctx.session = yield (0, _SessionData_1.initial)();
                yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
    }
    else if (callback == 'N') {
        yield ctx.reply('AW 😭.\nWhats the reason?', {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = _sendAttendanceInternal_1.logReasonBotOnDinner;
    }
    else {
        yield ctx.reply('Error! Pls try again');
    }
});
//Attendance Dinner Logging Function
const dinnerLogAttendance = (ctx, rowNo, eventName, dinnerAttendance, dinnerReason) => __awaiter(void 0, void 0, void 0, function* () {
    const sheet = ctx.session.gSheet;
    if (sheet) {
        yield ctx.reply('Processing... Please wait...');
        yield sheet.loadCells();
        let dinnerA1 = ``;
        let dinnerReasonA1 = ``;
        if (eventName == 'Special Event') {
            dinnerA1 = `F${rowNo}`;
            dinnerReasonA1 = `G${rowNo}`;
        }
        else if (eventName == 'No LG' || eventName == 'LG') {
            dinnerA1 = `I${rowNo}`;
            dinnerReasonA1 = `J${rowNo}`;
        }
        const dinnerCell = yield sheet.getCellByA1(dinnerA1);
        const dinnerReasonCell = yield sheet.getCellByA1(dinnerReasonA1);
        dinnerCell.value = dinnerAttendance;
        dinnerReasonCell.value = dinnerReason;
        yield sheet.saveUpdatedCells();
    }
});
