import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session } from 'grammy';
import { initial } from './models/SessionData';
import { BotContext } from './app';
import {
  Command,
  adminWelfareCallback,
  sendWishCallback,
  startCallback,
} from './functions';

const token = process.env.TOKEN || '';
// Create an instance of the `Bot` class and pass your bot token to it.

const bot = new Bot<BotContext>(token); // <-- put your bot token between the ""

bot.use(session({ initial }));

//Initialise Commands
//Call /start command
bot.command('start', Command.start);
//Call /help command
bot.command('help', Command.help);
//Call /settings command
bot.command('settings', Command.settings);
//Call /claim command
//bot.command('claim');
//Call /adminWelfare command
bot.command('adminWelfare', Command.adminWelfare);
//Call /sendwish command
bot.command('sendwish', Command.sendWish);

//Initiallise Callbacks
// /start Callbacks
bot.callbackQuery(/^nameStart-/g, startCallback.startReply);
bot.callbackQuery('confirm_YES', startCallback.confirmReply_Yes);
bot.callbackQuery('select_YES', startCallback.confirmReply_Yes);
bot.callbackQuery('confirm_NO', startCallback.confirmReply_No);
bot.callbackQuery('select_NO', startCallback.selectreply_No);
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, sendWishCallback.EventReply);
// /adminWelfare Callbacks
bot.callbackQuery('seeWelfareWishes', adminWelfareCallback.seeWish_1);
bot.callbackQuery(/^welfareWish_1-/g, adminWelfareCallback.seeWish_2);
bot.callbackQuery('manageReminder', adminWelfareCallback.reminderManagement);
bot.callbackQuery(
  'sendSpecificReminder',
  adminWelfareCallback.sendSpecificReminder_1
);
bot.callbackQuery(
  /^reminderSpecificEvents-/g,
  adminWelfareCallback.sendSpecificReminder_2
);
bot.callbackQuery(
  /^reminderSpecificNames-/g,
  adminWelfareCallback.sendSpecificReminder_3
);
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', sendWishCallback.FinalReply);

// Start the bot.
bot.start();
