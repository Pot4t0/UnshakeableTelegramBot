"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const grammy_1 = require("grammy");
const SessionData_1 = require("./models/SessionData");
const functions_1 = require("./functions");
const token = process.env.TOKEN || '';
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new grammy_1.Bot(token); // <-- put your bot token between the ""
bot.use((0, grammy_1.session)({ initial: SessionData_1.initial }));
//Initialise Commands
//Call /start command
bot.command('start', functions_1.Command.start);
//Call /help command
bot.command('help', functions_1.Command.help);
//Call /settings command
bot.command('settings', functions_1.Command.settings);
//Call /claim command
//bot.command('claim');
//Call /adminWelfare command
bot.command('adminWelfare', functions_1.Command.adminWelfare);
//Call /sendwish command
bot.command('sendwish', functions_1.Command.sendWish);
//Initiallise Callbacks
// /start Callbacks
bot.callbackQuery(/^nameStart-/g, functions_1.startCallback.startReply);
bot.callbackQuery('confirm_YES', functions_1.startCallback.confirmReply_Yes);
bot.callbackQuery('select_YES', functions_1.startCallback.confirmReply_Yes);
bot.callbackQuery('confirm_NO', functions_1.startCallback.confirmReply_No);
bot.callbackQuery('select_NO', functions_1.startCallback.selectreply_No);
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, functions_1.sendWishCallback.EventReply);
// /adminWelfare Callbacks
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', functions_1.sendWishCallback.FinalReply);
// Start the bot.
bot.start();
