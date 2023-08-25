"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unshakeableAttendanceSpreadsheet = exports.unshakeableSFSpreadsheet = void 0;
const google_spreadsheet_1 = require("google-spreadsheet");
const google_auth_library_1 = require("google-auth-library");
require("reflect-metadata");
require("dotenv/config");
// const jsonString = fs.readFileSync('unshakeable-760dbf55579d.json', 'utf-8');
// const creds = JSON.parse(jsonString);
const auth = new google_auth_library_1.JWT({
    // env var values here are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    email: process.env.SHEETS_EMAIL || '',
    key: process.env.SHEETSKEY || '',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
exports.unshakeableSFSpreadsheet = new google_spreadsheet_1.GoogleSpreadsheet(process.env.SF_TOKEN || '', auth);
exports.unshakeableAttendanceSpreadsheet = new google_spreadsheet_1.GoogleSpreadsheet(process.env.ATTENDANCE_TOKEN || '', auth);
