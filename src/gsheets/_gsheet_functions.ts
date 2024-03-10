import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { Settings } from '../database_mongoDB/Entity/_tableEntity';
import { Database } from '../database_mongoDB/_db-init';

export const changeSheet = async (
  sheetName: 'Attendance' | 'Finance' | 'SF',
  sheetId: string
) => {
  const gsheetobj = await Database.getMongoRepository(Settings).findOneBy({
    option: 'gsheet',
  });
  if (!gsheetobj) {
    console.log('Error: Could not find gsheet settings');
    return;
  }
  const gsheet = gsheetobj?.config;
  switch (sheetName) {
    case 'Attendance':
      gsheet[0] = sheetId;
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'gsheet' },
        { $set: { config: gsheet } }
      );
      process.env.ATTENDANCE_TOKEN = sheetId;
      break;
    case 'SF':
      gsheet[1] = sheetId;
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'gsheet' },
        { $set: { config: gsheet } }
      );
      process.env.SF_TOKEN = sheetId;
      break;
    case 'Finance':
      gsheet[2] = sheetId;
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'gsheet' },
        { $set: { config: gsheet } }
      );
      process.env.FINANCE_TOKEN = sheetId;
      break;
    default:
      console.log('Invalid sheetName');
      break;
  }
};

export const searchRowNo = async (
  search: string,
  sheet: GoogleSpreadsheetWorksheet,
  col: string,
  min: number,
  max: number
) => {
  let left = min;
  let right = max - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cell = sheet.getCellByA1(`${col}${mid}`);
    const cellValue = cell.value as string;

    if (cellValue === search) {
      return mid;
    } else if (cellValue < search) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
};
