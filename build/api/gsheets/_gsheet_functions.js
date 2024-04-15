"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRowNo = exports.changeSheet = void 0;
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_init_1 = require("../database_mongoDB/_db-init");
const changeSheet = async (sheetName, sheetId) => {
    const gsheetobj = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
        option: 'gsheet',
    });
    if (!gsheetobj) {
        console.log('Error: Could not find gsheet settings');
        return;
    }
    const gsheet = gsheetobj === null || gsheetobj === void 0 ? void 0 : gsheetobj.config;
    switch (sheetName) {
        case 'Attendance':
            gsheet[0] = sheetId;
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'gsheet' }, { $set: { config: gsheet } });
            process.env.ATTENDANCE_TOKEN = sheetId;
            break;
        case 'SF':
            gsheet[1] = sheetId;
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'gsheet' }, { $set: { config: gsheet } });
            process.env.SF_TOKEN = sheetId;
            break;
        case 'Finance':
            gsheet[2] = sheetId;
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'gsheet' }, { $set: { config: gsheet } });
            process.env.FINANCE_TOKEN = sheetId;
            break;
        default:
            console.log('Invalid sheetName');
            break;
    }
};
exports.changeSheet = changeSheet;
const searchRowNo = async (search, sheet, col, min, max) => {
    try {
        const indices = Array.from({ length: max - min }, (_, i) => min + i);
        const results = indices.map((index) => {
            const cell = sheet.getCellByA1(`${col}${index}`);
            const cellValue = cell.value;
            return { index, value: cellValue };
        });
        const foundItem = results.find((item) => item.value === search);
        if (foundItem) {
            return foundItem.index;
        }
        else {
            return -1;
        }
    }
    catch (_a) {
        return -1;
    }
};
exports.searchRowNo = searchRowNo;
