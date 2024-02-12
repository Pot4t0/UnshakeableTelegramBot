import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session } from 'grammy';
import { BotContext } from '../app/_index';
import { initial } from '../models/_SessionData';
import { conversations } from '@grammyjs/conversations';
import { init } from '../database_mongoDB/_db-init';
import { auth } from '../gsheets/_gsheet_init';
import { GoogleSpreadsheet } from 'google-spreadsheet';

//Initilaise Telegram Bot
export const init_bot = () => {
  init();
  const token = process.env.BOT_TOKEN || '';
  const bot = new Bot<BotContext>(token);
  if (!token) throw new Error('BOT_TOKEN is unset');
  bot.use(session({ initial }));
  bot.use(conversations());
  return bot;
};

//Initilaise Google Sheets
export const gsheet = async (type: 'attendance' | 'finance' | 'sf') => {
  switch (type) {
    case 'attendance':
      const doc = new GoogleSpreadsheet(
        process.env.ATTENDANCE_TOKEN || '',
        auth
      );
      await doc.loadInfo();
      return doc;
    case 'finance':
      const finance = new GoogleSpreadsheet(
        process.env.FINANCE_TOKEN || '',
        auth
      );
      await finance.loadInfo();
      return finance;
    case 'sf':
      const sf = new GoogleSpreadsheet(process.env.SF_TOKEN || '', auth);
      await sf.loadInfo();
      return sf;
    default:
      throw new Error('Invalid Google Sheet Type');
  }
};
