"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gsheet = exports.init_bot = void 0;
require("reflect-metadata");
require("dotenv/config");
const grammy_1 = require("grammy");
const _SessionData_1 = require("../models/_SessionData");
const conversations_1 = require("@grammyjs/conversations");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _gsheet_init_1 = require("../gsheets/_gsheet_init");
const google_spreadsheet_1 = require("google-spreadsheet");
//Initilaise Telegram Bot
const init_bot = () => {
    (0, _db_init_1.init)();
    const token = process.env.BOT_TOKEN || '';
    const bot = new grammy_1.Bot(token);
    if (!token)
        throw new Error('BOT_TOKEN is unset');
    bot.use((0, grammy_1.session)({ initial: _SessionData_1.initial }));
    bot.use((0, conversations_1.conversations)());
    return bot;
};
exports.init_bot = init_bot;
//Initilaise Google Sheets
const gsheet = async (type) => {
    switch (type) {
        case 'attendance':
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.ATTENDANCE_TOKEN || '', _gsheet_init_1.auth);
            await doc.loadInfo();
            return doc;
        case 'finance':
            const finance = new google_spreadsheet_1.GoogleSpreadsheet(process.env.FINANCE_TOKEN || '', _gsheet_init_1.auth);
            await finance.loadInfo();
            return finance;
        case 'sf':
            const sf = new google_spreadsheet_1.GoogleSpreadsheet(process.env.SF_TOKEN || '', _gsheet_init_1.auth);
            await sf.loadInfo();
            return sf;
        default:
            throw new Error('Invalid Google Sheet Type');
    }
};
exports.gsheet = gsheet;
