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
exports.addAttendanceSheet_CreateSpecialEventSheet = exports.addAttendanceSheet_SpecialEventDateMessage = exports.addAttendanceSheet_CreateNoLGEventSheet = exports.addAttendanceSheet_CreateLGEventSheet = exports.addAttendanceSheet_LGEventWEDateMessage = void 0;
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
const _gsheet_init_1 = require("../../../gsheets/_gsheet_init");
const __adminAttendanceInternal_1 = require("./__adminAttendanceInternal");
// LG Event Worship Experience Date
// Used in _botOn_functions.ts in botOntype = 21
const addAttendanceSheet_LGEventWEDateMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    ctx.session.eventDate = yield ctx.message.text;
    if (ctx.session.eventDate == null) {
        (0, exports.addAttendanceSheet_LGEventWEDateMessage)(ctx);
    }
    yield ctx.reply('Enter LG Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.createLgEventBotOn;
});
exports.addAttendanceSheet_LGEventWEDateMessage = addAttendanceSheet_LGEventWEDateMessage;
// Create LG Event Sheet
// Used in _botOn_functions.ts in botOntype = 22
const addAttendanceSheet_CreateLGEventSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lgDate = yield ctx.message.text;
    if (lgDate == null) {
        (0, exports.addAttendanceSheet_CreateLGEventSheet)(ctx);
    }
    const weDate = ctx.session.eventDate;
    if (lgDate && weDate) {
        ctx.session.botOnType = yield undefined;
        const lgDateArray = lgDate.split('/');
        const weDateArray = (yield ((_a = ctx.session.eventDate) === null || _a === void 0 ? void 0 : _a.split('/'))) || '';
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
        const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
        if (sheetExist == undefined) {
            yield templateSheet.duplicate({
                title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
            });
            const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
            yield newSheet.loadCells();
            const lgDateCell = yield newSheet.getCellByA1(`F2`);
            const weDateCell = yield newSheet.getCellByA1(`C2`);
            weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
            lgDateCell.value = `${lgDateArray[0]}/${lgDateArray[1]}/${lgDateArray[2]}`;
            yield newSheet.saveUpdatedCells();
            const title = `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
            yield ctx.reply(`${title} sheet has been created`);
            yield (0, __adminAttendanceInternal_1.createEventDBDoc)(title, weDate);
        }
        else {
            yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
        }
        ctx.session = (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
exports.addAttendanceSheet_CreateLGEventSheet = addAttendanceSheet_CreateLGEventSheet;
// Create No LG Event Sheet
// Used in _botOn_functions.ts in botOntype = 23
const addAttendanceSheet_CreateNoLGEventSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const weDate = yield ctx.message.text;
    if (weDate == null) {
        (0, exports.addAttendanceSheet_CreateNoLGEventSheet)(ctx);
    }
    if (weDate) {
        ctx.session.botOnType = yield undefined;
        const weDateArray = weDate.split('/');
        ctx.session = (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
        const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
        const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
        if (sheetExist == undefined) {
            yield templateSheet.duplicate({
                title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
            });
            const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
            yield newSheet.loadCells();
            2;
            const lgCell = yield newSheet.getCellByA1(`F3`);
            const lgReasonCell = yield newSheet.getCellByA1(`G3`);
            const weDateCell = yield newSheet.getCellByA1(`C2`);
            weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
            lgCell.value = 'No LG';
            lgReasonCell.value = '';
            yield newSheet.saveUpdatedCells();
            const title = `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
            yield ctx.reply(`${title} sheet has been created`);
            yield (0, __adminAttendanceInternal_1.createEventDBDoc)(title, weDate);
        }
        else {
            yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
        }
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
exports.addAttendanceSheet_CreateNoLGEventSheet = addAttendanceSheet_CreateNoLGEventSheet;
// Special Event Date
// Used in _botOn_functions.ts in botOntype = 24
const addAttendanceSheet_SpecialEventDateMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const specialEvntName = yield ctx.message.text;
    if (specialEvntName == null) {
        (0, exports.addAttendanceSheet_SpecialEventDateMessage)(ctx);
    }
    ctx.session.eventName = specialEvntName;
    yield ctx.reply('Enter Special Event Date in dd/mm/yyyy:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.createSplEventBotOn;
});
exports.addAttendanceSheet_SpecialEventDateMessage = addAttendanceSheet_SpecialEventDateMessage;
// Create Special Event Sheet
// Used in _botOn_functions.ts in botOntype = 25
const addAttendanceSheet_CreateSpecialEventSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event_date = yield ctx.message.text;
    if (event_date == null) {
        (0, exports.addAttendanceSheet_CreateSpecialEventSheet)(ctx);
    }
    const event_name = ctx.session.eventName;
    ctx.session.botOnType = yield undefined;
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`${event_name} (${event_date}) created`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `${event_name} (${event_date})`,
        });
        const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`${event_name} (${event_date})`];
        yield newSheet.loadCells();
        const eventDateCell = newSheet.getCellByA1('C2');
        const eventNameCell = newSheet.getCellByA1('C3');
        const meal = ctx.session.eventMeal;
        if (meal != 'NM') {
            const mealCell = newSheet.getCellByA1('F3');
            const mealReasonCell = newSheet.getCellByA1('G3');
            mealCell.value = meal;
            mealReasonCell.value = 'Reason';
        }
        if (event_date && event_name) {
            eventDateCell.value = event_date;
            eventNameCell.value = event_name;
            yield newSheet.saveUpdatedCells();
            const title = `${event_name} (${event_date})`;
            yield (0, __adminAttendanceInternal_1.createEventDBDoc)(title, event_date);
            yield ctx.reply(`${title} sheet has been created`);
        }
        else {
            yield ctx.reply(`Error during creation! Please try again!`);
        }
    }
    else {
        yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_CreateSpecialEventSheet = addAttendanceSheet_CreateSpecialEventSheet;
