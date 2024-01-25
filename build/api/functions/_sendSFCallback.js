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
exports.sendToSheet_Reason = exports.sendToSheet_SF = exports.sendsfFunctions = void 0;
const _index_1 = require("../gsheets/_index");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../models/_SessionData");
//Send SF Callbacks
const sendsfFunctions = (bot) => __awaiter(void 0, void 0, void 0, function* () {
    bot.callbackQuery('AttendanceSF-yes', sendSF);
    bot.callbackQuery('AttendanceSF-no', sendReason);
});
exports.sendsfFunctions = sendsfFunctions;
// Send SF Callback
// For attendance = yes
const sendSF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. 😎
  \n\nPlease type down your sermon feedback:
  `, {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 8;
});
// Send Reason Callback
// For attendance = no
const sendReason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
	Reason for not attending service :(
	`, {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 9;
});
// Send to Google Sheets Sermon Feedback
// Used in _botOn_functions.ts in botOntype = 8
// export const sendToSheet_SF = async (ctx: Filter<BotContext, 'message'>) => {
const sendToSheet_SF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const sfmsg = yield ctx.message.text;
    const teleUserName = yield ctx.update.message.from.username;
    if (sfmsg == null && ctx.session.botOnType == null) {
        (0, exports.sendToSheet_SF)(ctx);
    }
    else {
        if (sfmsg && teleUserName && ctx.session.botOnType == 8) {
            yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
            const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
            const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                teleUser: teleUserName,
            });
            const newRow = yield sheet.addRow({
                timeStamp: Date(),
                name: user[0].nameText,
                sermonFeedback: sfmsg,
                attendance: 'Yes',
                reason: '',
            });
            if (newRow) {
                const collection = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).findOneBy({
                    teleUser: teleUserName,
                });
                if (!collection) {
                    const sfevent = new _tableEntity_1.SF_mongo();
                    sfevent.teleUser = teleUserName;
                    sfevent.attendance = ['Y'];
                    sfevent.sf = sfmsg;
                    sfevent.timestamp = new Date();
                    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).save(sfevent);
                }
                else {
                    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).updateOne({ teleUser: teleUserName }, { $set: { attendance: ['Y'], sf: sfmsg, timestamp: new Date() } });
                }
                yield ctx.reply('Sent! Your SF has been recorded successfully.');
            }
            else {
                yield ctx.reply('ERROR! Failed to log SF. Pls try again!');
            }
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            ctx.session = yield (0, _SessionData_1.initial)();
        }
        else {
            yield ctx.reply('ERROR! Pls try again!');
        }
    }
});
exports.sendToSheet_SF = sendToSheet_SF;
// Send to Google Sheets Reason
// Used in _botOn_functions.ts in botOntype = 9
const sendToSheet_Reason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const teleUserName = yield ctx.update.message.from.username;
    const reason = yield ctx.message.text;
    if (reason == null && ctx.session.botOnType == null) {
        (0, exports.sendToSheet_Reason)(ctx);
    }
    else {
        if (reason && teleUserName && ctx.session.botOnType == 9) {
            yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
            const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
            const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                teleUser: teleUserName,
            });
            const newRow = yield sheet.addRow({
                timeStamp: Date(),
                name: user[0].nameText,
                sermonFeedback: '',
                attendance: 'No',
                reason: reason,
            });
            if (newRow) {
                const collection = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).findOneBy({
                    teleUser: teleUserName,
                });
                if (!collection) {
                    const sf = new _tableEntity_1.SF_mongo();
                    sf.teleUser = teleUserName;
                    sf.attendance = ['N', reason];
                    sf.sf = '';
                    sf.timestamp = new Date();
                    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).save(sf);
                }
                else {
                    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).updateOne({ teleUser: teleUserName }, {
                        $set: {
                            attendance: ['N', reason],
                            sf: '',
                            timestamp: new Date(),
                        },
                    });
                }
                yield ctx.reply('Sent! Your SF has been recorded successfully.');
            }
            else {
                yield ctx.reply('ERROR! Failed to log SF. Pls try again!');
            }
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            ctx.session = yield (0, _SessionData_1.initial)();
        }
        else {
            yield ctx.reply('ERROR! Please try again!');
        }
    }
});
exports.sendToSheet_Reason = sendToSheet_Reason;
