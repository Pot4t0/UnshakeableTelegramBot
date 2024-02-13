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
    let left = min;
    let right = max - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const cell = sheet.getCellByA1(`${col}${mid}`);
        const cellValue = cell.value;
        if (cellValue === search) {
            return mid;
        }
        else if (cellValue < search) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }
    return -1;
};
exports.searchRowNo = searchRowNo;
