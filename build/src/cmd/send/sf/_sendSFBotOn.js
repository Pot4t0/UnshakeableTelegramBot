"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToSheet_Reason = exports.sendToSheet_SF = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
// Send to Google Sheets Sermon Feedback
// Used in _botOn_functions.ts in botOntype = 8
const sendToSheet_SF = async (ctx) => {
    const sfmsg = await ctx.message.text;
    const teleUserName = await ctx.update.message.from.username;
    const sheet = ctx.session.gSheet;
    try {
        if (sfmsg == null) {
            (0, exports.sendToSheet_SF)(ctx);
        }
        else {
            if (sfmsg && teleUserName && sheet) {
                const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                    teleUser: teleUserName,
                });
                const newRow = await sheet.addRow({
                    timeStamp: Date(),
                    name: user[0].nameText,
                    sermonFeedback: sfmsg,
                    attendance: 'Yes',
                    reason: '',
                });
                if (newRow) {
                    const collection = await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).findOneBy({
                        teleUser: teleUserName,
                    });
                    if (!collection) {
                        const sfevent = new _tableEntity_1.SF_mongo();
                        sfevent.teleUser = teleUserName;
                        sfevent.attendance = ['Y'];
                        sfevent.sf = sfmsg;
                        sfevent.timestamp = new Date();
                        await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).save(sfevent);
                    }
                    else {
                        await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).updateOne({ teleUser: teleUserName }, { $set: { attendance: ['Y'], sf: sfmsg, timestamp: new Date() } });
                    }
                    await ctx.reply('Sent! Your SF has been recorded successfully.');
                }
                else {
                    await ctx.reply('ERROR! Failed to log SF. Pls try again!');
                    console.log('SendSF Failed');
                }
                sheet.resetLocalCache();
            }
            else {
                await ctx.reply('ERROR! Pls try again!');
                console.log('SendSF Failed');
            }
            ctx.session = (0, _SessionData_1.initial)();
        }
    }
    catch (err) {
        await ctx.reply('ERROR! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.sendToSheet_SF = sendToSheet_SF;
// Send to Google Sheets Reason
// Used in _botOn_functions.ts in botOntype = 9
const sendToSheet_Reason = async (ctx) => {
    const teleUserName = await ctx.update.message.from.username;
    const reason = await ctx.message.text;
    const sheet = ctx.session.gSheet;
    try {
        if (reason == null) {
            (0, exports.sendToSheet_Reason)(ctx);
        }
        else {
            if (reason && teleUserName && sheet) {
                const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                    teleUser: teleUserName,
                });
                const newRow = await sheet.addRow({
                    timeStamp: Date(),
                    name: user[0].nameText,
                    sermonFeedback: '',
                    attendance: 'No',
                    reason: reason,
                });
                if (newRow) {
                    const collection = await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).findOneBy({
                        teleUser: teleUserName,
                    });
                    if (!collection) {
                        const sf = new _tableEntity_1.SF_mongo();
                        sf.teleUser = teleUserName;
                        sf.attendance = ['N', reason];
                        sf.sf = '';
                        sf.timestamp = new Date();
                        await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).save(sf);
                    }
                    else {
                        await _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).updateOne({ teleUser: teleUserName }, {
                            $set: {
                                attendance: ['N', reason],
                                sf: '',
                                timestamp: new Date(),
                            },
                        });
                    }
                    await ctx.reply('Sent! Your reason has been recorded successfully.');
                }
                else {
                    await ctx.reply('ERROR! Failed to log reason. Pls try again!');
                    console.log('SendSF Reason Failed');
                }
                sheet.resetLocalCache();
            }
            else {
                await ctx.reply('ERROR! Please try again!');
                console.log('SendSF Reason Failed');
            }
            ctx.session = (0, _SessionData_1.initial)();
        }
    }
    catch (err) {
        await ctx.reply('ERROR! Please try again!');
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.sendToSheet_Reason = sendToSheet_Reason;
