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
exports.sendSfEvent_2_yes = exports.sendSfEvent_2_no = exports.sendSfEvent_1_no = exports.sendSfEvent_1 = void 0;
const _index_1 = require("../gsheets/_index");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const sendSfEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
  For those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. :-)
  \n\nPlease type down your sermon feedback:
  `, {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 8;
});
exports.sendSfEvent_1 = sendSfEvent_1;
const sendSfEvent_1_no = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.attendance = yield ctx.update.callback_query.data.substring('AttendanceSF-'.length);
    yield ctx.reply(`
	Reason for not attending service :(
	`, {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 9;
});
exports.sendSfEvent_1_no = sendSfEvent_1_no;
// botOntype = 9
const sendSfEvent_2_no = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text || '';
    yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.message.from.username,
    });
    yield sheet.addRow({
        timeStamp: Date(),
        name: user[0].nameText,
        sermonFeedback: '',
        attendance: 'No',
        reason: reason,
    });
    const data_sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
    yield data_sheet.loadCells();
    const sfCell = yield data_sheet.getCellByA1(`C${user[0].sfrow}`);
    const attendanceCell = yield data_sheet.getCellByA1(`D${user[0].sfrow}`);
    const reasonCell = yield data_sheet.getCellByA1(`E${user[0].sfrow}`);
    const timeStampCell = yield data_sheet.getCellByA1(`F${user[0].sfrow}`);
    sfCell.value = '';
    attendanceCell.value = 'No';
    reasonCell.value = reason;
    (timeStampCell.value = Date()), yield data_sheet.saveUpdatedCells();
    yield ctx.reply('Sent!');
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendSfEvent_2_no = sendSfEvent_2_no;
// botOntype = 8
const sendSfEvent_2_yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = undefined;
    const sf = ctx.message.text || '';
    yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: ctx.update.message.from.username,
    });
    yield sheet.addRow({
        timeStamp: Date(),
        name: user[0].nameText,
        sermonFeedback: sf,
        attendance: 'Yes',
        reason: '',
    });
    const data_sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
    yield data_sheet.loadCells();
    const sfCell = yield data_sheet.getCellByA1(`C${user[0].sfrow}`);
    const attendanceCell = yield data_sheet.getCellByA1(`D${user[0].sfrow}`);
    const reasonCell = yield data_sheet.getCellByA1(`E${user[0].sfrow}`);
    const timeStampCell = yield data_sheet.getCellByA1(`F${user[0].sfrow}`);
    sfCell.value = sf;
    attendanceCell.value = 'Yes';
    reasonCell.value = '';
    timeStampCell.value = Date();
    yield data_sheet.saveUpdatedCells();
    yield ctx.reply('Sent!');
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendSfEvent_2_yes = sendSfEvent_2_yes;
