import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Settings } from '../database_mongoDB/Entity/_tableEntity';
import { Database } from '../database_mongoDB/_db-init';

/**
 * Change the Google Sheet associated with a particular functionality.
 * @param {('Attendance' | 'Finance' | 'SF')} sheetName The name of the sheet to change.
 * @param {string} sheetId The ID of the new sheet.
 */
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

/**
 * Search for a specific value in a given column within a Google Sheet.
 * @param {string} search The value to search for.
 * @param {GoogleSpreadsheetWorksheet} sheet The Google Spreadsheet to search in.
 * @param {string} col The column to search within.
 * @param {number} min The minimum row index to search from.
 * @param {number} max The maximum row index to search up to.
 * @returns {Promise<number>} The row index where the value is found, or -1 if not found.
 */
export const searchRowNo = async (
  search: string,
  sheet: GoogleSpreadsheetWorksheet,
  col: string,
  min: number,
  max: number
): Promise<number> => {
  try {
    const indices = Array.from({ length: max - min }, (_, i) => min + i);

    const results = indices.map((index) => {
      const cell = sheet.getCellByA1(`${col}${index}`);
      const cellValue = cell.value as string;
      return { index, value: cellValue };
    });

    const foundItem = results.find((item) => item.value === search);

    if (foundItem) {
      return foundItem.index;
    } else {
      return -1;
    }
  } catch {
    return -1;
  }
};
