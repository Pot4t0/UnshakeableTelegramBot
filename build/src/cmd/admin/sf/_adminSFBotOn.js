"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSFNo = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _initialise_1 = require("../../../functions/_initialise");
const manualSFNo = async (ctx) => {
    const reason = await ctx.message.text;
    if (reason == null) {
        (0, exports.manualSFNo)(ctx);
    }
    if (reason) {
        const unshakeableSFSpreadsheet = (0, _initialise_1.gsheet)('sf');
        const sheet = (await unshakeableSFSpreadsheet).sheetsByTitle['Telegram Responses'];
        const teleUserName = ctx.session.name || '';
        const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        await sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: '',
            attendance: 'No',
            reason: reason,
        });
        (await unshakeableSFSpreadsheet).resetLocalCache();
        await ctx.reply('Sent!');
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.manualSFNo = manualSFNo;
