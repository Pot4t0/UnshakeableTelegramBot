"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinnerAttendanceReason = exports.SpecialAttendanceLogReason = exports.lgAttendanceLogReason = exports.WeAttendanceLogReason = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _sendAttendanceInternal_1 = require("./_sendAttendanceInternal");
// WE Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 19
// Logs Reason Message to Google Sheets
const WeAttendanceLogReason = async (ctx) => {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.WeAttendanceLogReason)(ctx);
    }
    try {
        const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        const sheet = ctx.session.gSheet;
        if (sheet) {
            await sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            await sheet.saveUpdatedCells();
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
                await ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
                    reply_markup: { inline_keyboard: inlineKeyboard },
                });
            }
            else {
                await ctx.reply('Error! Pls try again');
                ctx.session = (0, _SessionData_1.initial)();
                sheet.resetLocalCache();
            }
        }
    }
    catch (err) {
        await ctx.reply('Could not log reason! Please try again!');
        console.log(err);
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.WeAttendanceLogReason = WeAttendanceLogReason;
// LG Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 20
// Logs Reason Message to Google Sheets
const lgAttendanceLogReason = async (ctx) => {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.lgAttendanceLogReason)(ctx);
    }
    try {
        const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        const sheet = ctx.session.gSheet;
        if (sheet) {
            await sheet.loadCells();
            const attendanceCell = await sheet.getCellByA1(`F${user[0].attendanceRow}`);
            const reasonCell = await sheet.getCellByA1(`G${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            await sheet.saveUpdatedCells();
            sheet.resetLocalCache();
            await ctx.reply('Attendance logged! Thanks for submitting!');
        }
        else {
            await ctx.reply('Error! Pls try again');
        }
    }
    catch (err) {
        await ctx.reply('Could not log reason! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.lgAttendanceLogReason = lgAttendanceLogReason;
// Special Attendance Logging Reason Function
// Used in _botOn_functions.ts in botOntype = 28
// Logs Reason Message to Google Sheets
const SpecialAttendanceLogReason = async (ctx) => {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    try {
        if (reason == null) {
            (0, exports.SpecialAttendanceLogReason)(ctx);
        }
        const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: ctx.update.message.from.username,
        });
        const sheet = ctx.session.gSheet;
        if (sheet) {
            await sheet.loadCells();
            const attendanceCell = sheet.getCellByA1(`C${user[0].attendanceRow}`);
            const reasonCell = sheet.getCellByA1(`D${user[0].attendanceRow}`);
            attendanceCell.value = 'N';
            reasonCell.value = reason;
            await sheet.saveUpdatedCells();
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
                await ctx.reply(`Are you coming for ${meal.toLowerCase()}?`, {
                    reply_markup: { inline_keyboard: inlineKeyboard },
                });
            }
            else {
                await ctx.reply('Attendance logged! Thanks for submitting!');
                ctx.session = (0, _SessionData_1.initial)();
            }
        }
    }
    catch (err) {
        await ctx.reply('Could not log reason! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.SpecialAttendanceLogReason = SpecialAttendanceLogReason;
// Dinner Attendance Reason Function
// Used in _botOn_functions.ts in botOntype = 29
// Logs Reason Message to Google Sheets (Special/ No LG Event)
// Proceeds to move to LG Attendance Function (LG Event)
const dinnerAttendanceReason = async (ctx) => {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.dinnerAttendanceReason)(ctx);
    }
    else {
        try {
            const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                teleUser: ctx.update.message.from.username,
            });
            switch (ctx.session.eventName) {
                case 'Special Event':
                    await (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
                    ctx.session = (0, _SessionData_1.initial)();
                    break;
                case 'No LG':
                    await (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
                    ctx.session = (0, _SessionData_1.initial)();
                    break;
                case 'LG':
                    await (0, _sendAttendanceInternal_1.dinnerLogAttendance)(ctx, user[0].attendanceRow, ctx.session.eventName, 'N', reason);
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
                        await ctx.reply(`Are you coming for LG? on the ${lgDateCell.value}`, {
                            reply_markup: { inline_keyboard: inlineKeyboard },
                        });
                    }
                    break;
                default:
                    await ctx.reply('Error! Pls try again');
                    ctx.session = (0, _SessionData_1.initial)();
            }
        }
        catch (err) {
            await ctx.reply('Could not log reason! Please try again!');
            console.log(err);
            ctx.session = (0, _SessionData_1.initial)();
        }
    }
};
exports.dinnerAttendanceReason = dinnerAttendanceReason;
