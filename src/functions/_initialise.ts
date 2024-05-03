import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session } from 'grammy';
import { BotContext } from '../app/_index';
import { initial } from '../models/_SessionData';
import { conversations } from '@grammyjs/conversations';
import { init } from '../database_mongoDB/_db-init';
import { auth } from '../gsheets/_gsheet_init';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { hydrateFiles } from '@grammyjs/files';

/**
 * Initialise the Telegram bot with the bot token.
 * @returns The Telegram bot.
 */
export const init_bot = () => {
  // Initialise MongoDB database
  init();

  // Retrieve bot token from environment variables
  const token = process.env.BOT_TOKEN || '';
  const bot = new Bot<BotContext>(token);

  // Throw an error if BOT_TOKEN is not set
  if (!token) throw new Error('BOT_TOKEN is unset');

  // Set up session middleware with initial session data
  bot.use(session({ initial }));

  // Enable file handling for the bot
  bot.api.config.use(hydrateFiles(token));

  // Enable conversation management for the bot
  bot.use(conversations());

  return bot;
};

/**
 * Load the Google Spreadsheet for the specified type.
 * @param type The type of Google Spreadsheet to load.
 * @returns The Google Spreadsheet.
 * @throws Error if the type is invalid.
 * @throws Error if the Google Spreadsheet could not be loaded.
 * @throws Error if the Google Spreadsheet info could not be loaded.
 */
export const gsheet = async (type: 'attendance' | 'finance' | 'sf') => {
  switch (type) {
    case 'attendance':
      // Load attendance Google Spreadsheet
      const doc = new GoogleSpreadsheet(
        process.env.ATTENDANCE_TOKEN || '',
        auth
      );
      await doc.loadInfo(); // Load spreadsheet info
      return doc;
    case 'finance':
      // Load finance Google Spreadsheet
      const finance = new GoogleSpreadsheet(
        process.env.FINANCE_TOKEN || '',
        auth
      );
      await finance.loadInfo(); // Load spreadsheet info
      return finance;
    case 'sf':
      // Load SF Google Spreadsheet
      const sf = new GoogleSpreadsheet(process.env.SF_TOKEN || '', auth);
      await sf.loadInfo(); // Load spreadsheet info
      return sf;
    default:
      throw new Error('Invalid Google Sheet Type');
  }
};
