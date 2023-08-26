import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCellErrorValue,
} from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import 'reflect-metadata';
import 'dotenv/config';
// const jsonString = fs.readFileSync('unshakeable-760dbf55579d.json', 'utf-8');
// const creds = JSON.parse(jsonString);

const auth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email:
    // creds.client_email,
    process.env.SHEETS_EMAIL,
  key:
    // creds.private_key,
    process.env.SHEETSKEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const unshakeableSFSpreadsheet = new GoogleSpreadsheet(
  process.env.SF_TOKEN || '',
  auth
);

export const unshakeableAttendanceSpreadsheet = new GoogleSpreadsheet(
  process.env.ATTENDANCE_TOKEN || '',
  auth
);
