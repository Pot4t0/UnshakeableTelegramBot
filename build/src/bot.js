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
//Call /sendsf command
bot.command('sendsf', functions_1.Command.sendsf);
//Call /sendwish command
bot.command('sendwish', functions_1.Command.sendWish);
//Call /adminWelfare command
bot.command('adminwelfare', functions_1.Command.adminWelfare);
//Initiallise Callbacks
// /start Callbacks
bot.callbackQuery(/^nameStart-/g, functions_1.startCallback.startReply);
bot.callbackQuery('confirm_YES', functions_1.startCallback.confirmReply_Yes);
bot.callbackQuery('select_YES', functions_1.startCallback.confirmReply_Yes);
bot.callbackQuery('confirm_NO', functions_1.startCallback.confirmReply_No);
bot.callbackQuery('select_NO', functions_1.startCallback.selectreply_No);
// /sendsf Callbacks
bot.callbackQuery('AttendanceSF-yes', functions_1.sendsfFunctions.sendSfEvent_1);
bot.callbackQuery('AttendanceSF-no', functions_1.sendsfFunctions.sendSfEvent_1_no);
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, functions_1.sendWishCallback.EventReply);
// /adminWelfare Callbacks
// bot.callbackQuery('seeWelfareWishes', adminWelfareCallback.seeWish_1);
bot.callbackQuery(/^welfareWish_1-/g, functions_1.adminWelfareCallback.seeWish_2);
//Welfare Event Management
bot.callbackQuery('manageWelfareEvent', functions_1.adminWelfareCallback.manageWelfareEvent);
//See Welfare Events
bot.callbackQuery('seeWelfareEvents', functions_1.adminWelfareCallback.seeWelfareEvents);
//Add Welfare Event
bot.callbackQuery('addWelfareEvent', functions_1.adminWelfareCallback.addWelfareEvent_1);
bot.callbackQuery(/^nameAddWelfareEvent-/g, functions_1.adminWelfareCallback.addWelfareEvent_4);
//Delete Welfare Event
bot.callbackQuery('deleteWelfareEvent', functions_1.adminWelfareCallback.deleteWelfareEvent_1);
bot.callbackQuery(/^delWelfareEvent-/g, functions_1.adminWelfareCallback.deleteWelfareEvent_2);
bot.callbackQuery('yesWelfareDelEvent', functions_1.adminWelfareCallback.deleteWelfareEvent_Yes);
bot.callbackQuery('noWelfareDelEvent', functions_1.adminWelfareCallback.deleteWelfareEvent_No);
//Edit Welfare Event
bot.callbackQuery('editWelfareEvent', functions_1.adminWelfareCallback.editWelfareEvent);
bot.callbackQuery(/^editWelfareEvent-/g, functions_1.adminWelfareCallback.editWelfareEventMenu);
bot.callbackQuery('editWelfareEventName', functions_1.adminWelfareCallback.editWelfareEventName_1);
bot.callbackQuery('editWelfareEventDate', functions_1.adminWelfareCallback.editWelfareEventDate_1);
bot.callbackQuery('editWelfareNotAllowedUser', functions_1.adminWelfareCallback.editWelfareNotAllowedUser_1);
bot.callbackQuery(/^editNotAllowedUser-/g, functions_1.adminWelfareCallback.editWelfareNotAllowedUser_2);
//Welfare Team Management
bot.callbackQuery('manageWelfareTeam', functions_1.adminWelfareCallback.manageWelfareTeam);
//Add Member
bot.callbackQuery('addWelfareMember', functions_1.adminWelfareCallback.addWelfareMember_1);
bot.callbackQuery(/^addWelfareMember-/g, functions_1.adminWelfareCallback.addWelfareMember_2);
//Delete Member
bot.callbackQuery('delWelfareMember', functions_1.adminWelfareCallback.delWelfareMember_1);
bot.callbackQuery(/^delWelfareMember-/g, functions_1.adminWelfareCallback.delWelfareMember_2);
//Edit Member
bot.callbackQuery('editWelfareMember', functions_1.adminWelfareCallback.editWelfareMember_1);
bot.callbackQuery(/^editWelfareMember-/g, functions_1.adminWelfareCallback.editWelfareMember_2);
//Welfare Reminder Mangement
bot.callbackQuery('manageReminder', functions_1.adminWelfareCallback.reminderManagement);
bot.callbackQuery('sendNotInReminder', functions_1.adminWelfareCallback.sendNotInReminder_1);
bot.callbackQuery(/^reminderNotInEvents-/g, functions_1.adminWelfareCallback.sendNotInReminder_2);
bot.callbackQuery('sendSpecificReminder', functions_1.adminWelfareCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderSpecificEvents-/g, functions_1.adminWelfareCallback.sendSpecificReminder_2);
bot.callbackQuery(/^reminderSpecificNames-/g, functions_1.adminWelfareCallback.sendSpecificReminder_3);
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', functions_1.botOnFunctions.botOnContext); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.
// Start the bot.
bot.start();
