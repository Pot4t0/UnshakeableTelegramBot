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
//Call /help command
bot.command("help", functions_1.Command.help);
//Call /settings command
bot.command("settings", functions_1.Command.settings);
//Call /claim command
bot.command("claim");
//Call /admin command
bot.command("admin", functions_1.Command.admin);
//Call /sendwish command
bot.command("sendwish", functions_1.Command.sendWish);
//Initiallise Callbacks
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, functions_1.sendWishCallback.EventReply);
bot.callbackQuery(/^name-/g, functions_1.sendWishCallback.NameReply);
// /admin Callbacks
bot.callbackQuery("wishManagement", functions_1.adminCallback.wishManagement);
bot.callbackQuery("seewish", functions_1.adminCallback.seeWish);
bot.callbackQuery(/^wishEvent-/g, functions_1.adminCallback.wishTable);
//pissing me off
bot.on('message', functions_1.sendWishCallback.FinalReply);
// Start the bot.
bot.start();
