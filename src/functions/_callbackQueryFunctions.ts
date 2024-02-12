import { Bot } from 'grammy';
import { BotContext } from '../app/_index';
import { start } from '../cmd/start/_index';
import { settings } from '../cmd/settings/_index';
import { admin } from '../cmd/admin/_index'; //Bot Admin Commands
import { reminder } from '../database_mongoDB/functions/_index';
import { send } from '../cmd/send/_index';

export const callbackQueryHandler = (bot: Bot<BotContext>) => {
  // Bot Commands Callback
  // /start Callbacks
  start(bot);
  // /settings Callbacks
  settings(bot);
  // /sendsf Callbacks
  send.sf(bot);
  // /sendwish Callbacks
  send.wish(bot);
  // /sendattendance Callbacks
  send.attendance(bot);
  // /sendclaim Callbacks
  send.claim(bot);
  // /adminWelfare Callbacks
  admin.welfare(bot);
  // /adminbday Callbacks
  admin.bday(bot);
  // /adminsf Callbacks
  admin.sf(bot);
  // /adminattendance Callbacks
  admin.attendance(bot);
  // /adminfinance Callbacks
  admin.finance(bot);

  // DB Callbacks
  //Specific Person Reminder
  reminder.specificReminder(bot);
};
