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
exports.manualSFNo = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
const manualSFNo = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const reason = yield ctx.message.text;
    if (reason == null) {
        (0, exports.manualSFNo)(ctx);
    }
    if (reason) {
        yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
        const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
        const teleUserName = (yield ctx.session.name) || '';
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        yield sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: '',
            attendance: 'No',
            reason: reason,
        });
        yield ctx.reply('Sent!');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
exports.manualSFNo = manualSFNo;
