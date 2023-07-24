import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session } from 'grammy';
import { initial } from './models/SessionData';
import { BotContext } from './app';
import { Command, adminCallback, sendWishCallback } from './functions';

const token = process.env.TOKEN || '';
// Create an instance of the `Bot` class and pass your bot token to it.

const bot = new Bot<BotContext>(token); // <-- put your bot token between the ""

bot.use(session({ initial }));

//Initialise Commands
//Call /help command
bot.command('help', Command.help);
//Call /settings command
bot.command('settings', Command.settings);
//Call /claim command
bot.command('claim');
//Call /admin command
bot.command('admin', Command.admin);
//Call /sendwish command
bot.command('sendwish', Command.sendWish);

//Initiallise Callbacks
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, sendWishCallback.EventReply);
bot.callbackQuery(/^name-/g, sendWishCallback.NameReply);
// /admin Callbacks
bot.callbackQuery('wishManagement', adminCallback.wishManagement);
bot.callbackQuery('seewish', adminCallback.seeWish);
bot.callbackQuery(/^wishEvent-/g, adminCallback.wishTable);

//pissing me off
bot.on('message', sendWishCallback.FinalReply);

// Start the bot.
bot.start();
