import { Bot } from 'grammy';
import { BotContext } from '../app/_index';
import { start } from '../cmd/start/_index';
import { settings } from '../cmd/settings/_index';
import { admin } from '../cmd/admin/_index'; //Bot Admin Commands
import { reminder } from '../database_mongoDB/functions/_index';
import { send } from '../cmd/send/_index';

/**
 * Handles callback queries from the bot.
 * @param {Bot<BotContext>} bot The bot instance.
 */
export const callbackQueryHandler = (bot: Bot<BotContext>) => {
  // Bot Commands Callback
  // /start Callbacks
  start(bot); // Executes start command callbacks
  // /settings Callbacks
  settings(bot); // Executes settings command callbacks
  // /sendsf Callbacks
  send.sf(bot); // Executes sendsf command callbacks
  // /sendwish Callbacks
  send.wish(bot); // Executes sendwish command callbacks
  // /sendattendance Callbacks
  send.attendance(bot); // Executes sendattendance command callbacks
  // /sendclaim Callbacks
  send.claim(bot); // Executes sendclaim command callbacks
  // /adminWelfare Callbacks
  admin.welfare(bot); // Executes adminWelfare command callbacks
  // /adminbday Callbacks
  admin.bday(bot); // Executes adminbday command callbacks
  // /adminsf Callbacks
  admin.sf(bot); // Executes adminsf command callbacks
  // /adminattendance Callbacks
  admin.attendance(bot); // Executes adminattendance command callbacks
  // /adminfinance Callbacks
  admin.finance(bot); // Executes adminfinance command callbacks

  // DB Callbacks
  //Specific Person Reminder
  reminder.specificReminder(bot); // Executes specificReminder callbacks
};
