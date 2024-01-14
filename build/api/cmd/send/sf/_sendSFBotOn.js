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
exports.sendToSheet_Reason = exports.sendToSheet_SF = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
// Send to Google Sheets Sermon Feedback
// Used in _botOn_functions.ts in botOntype = 8
const sendToSheet_SF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const sfmsg = yield ctx.message.text;
    const teleUserName = yield ctx.update.message.from.username;
    const sheet = ctx.session.gSheet;
    yield ctx.reply('Processing... Please wait...');
    try {
        if (sfmsg == null) {
            (0, exports.sendToSheet_SF)(ctx);
        }
        else {
            if (sfmsg && teleUserName && sheet) {
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
                    console.log('SendSF Failed');
                }
            }
            else {
                yield ctx.reply('ERROR! Pls try again!');
                console.log('SendSF Failed');
            }
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            ctx.session = yield (0, _SessionData_1.initial)();
        }
    }
    catch (err) {
        yield ctx.reply('ERROR! Please try again!');
        console.log(err);
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendToSheet_SF = sendToSheet_SF;
// Send to Google Sheets Reason
// Used in _botOn_functions.ts in botOntype = 9
const sendToSheet_Reason = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const teleUserName = yield ctx.update.message.from.username;
    const reason = yield ctx.message.text;
    const sheet = ctx.session.gSheet;
    yield ctx.reply('Processing... Please wait...');
    try {
        if (reason == null) {
            (0, exports.sendToSheet_Reason)(ctx);
        }
        else {
            if (reason && teleUserName && sheet) {
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
                    console.log('SendSF Failed');
                }
            }
            else {
                yield ctx.reply('ERROR! Please try again!');
                console.log('SendSF Failed');
            }
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
            ctx.session = yield (0, _SessionData_1.initial)();
        }
    }
    catch (err) {
        yield ctx.reply('ERROR! Please try again!');
        console.log(err);
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendToSheet_Reason = sendToSheet_Reason;
