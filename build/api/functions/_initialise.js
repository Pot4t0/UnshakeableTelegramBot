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
const files_1 = require("@grammyjs/files");
/**
 * Initialise the Telegram bot with the bot token.
 * @returns The Telegram bot.
 */
const init_bot = () => {
    // Initialise MongoDB database
    (0, _db_init_1.init)();
    // Retrieve bot token from environment variables
    const token = process.env.BOT_TOKEN || '';
    const bot = new grammy_1.Bot(token);
    // Throw an error if BOT_TOKEN is not set
    if (!token)
        throw new Error('BOT_TOKEN is unset');
    // Set up session middleware with initial session data
    bot.use((0, grammy_1.session)({ initial: _SessionData_1.initial }));
    // Enable file handling for the bot
    bot.api.config.use((0, files_1.hydrateFiles)(token));
    // Enable conversation management for the bot
    bot.use((0, conversations_1.conversations)());
    return bot;
};
exports.init_bot = init_bot;
/**
 * Load the Google Spreadsheet for the specified type.
 * @param type The type of Google Spreadsheet to load.
 * @returns The Google Spreadsheet.
 * @throws Error if the type is invalid.
 * @throws Error if the Google Spreadsheet could not be loaded.
 * @throws Error if the Google Spreadsheet info could not be loaded.
 */
const gsheet = async (type) => {
    switch (type) {
        case 'attendance':
            // Load attendance Google Spreadsheet
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.ATTENDANCE_TOKEN || '', _gsheet_init_1.auth);
            await doc.loadInfo(); // Load spreadsheet info
            return doc;
        case 'finance':
            // Load finance Google Spreadsheet
            const finance = new google_spreadsheet_1.GoogleSpreadsheet(process.env.FINANCE_TOKEN || '', _gsheet_init_1.auth);
            await finance.loadInfo(); // Load spreadsheet info
            return finance;
        case 'sf':
            // Load SF Google Spreadsheet
            const sf = new google_spreadsheet_1.GoogleSpreadsheet(process.env.SF_TOKEN || '', _gsheet_init_1.auth);
            await sf.loadInfo(); // Load spreadsheet info
            return sf;
        default:
            throw new Error('Invalid Google Sheet Type');
    }
};
exports.gsheet = gsheet;
