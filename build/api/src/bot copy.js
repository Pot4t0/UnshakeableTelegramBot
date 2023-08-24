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
//Call /attendance
bot.command('sendattendance', functions_1.Command.sendattendance);
//Call /adminWelfare command
bot.command('adminwelfare', functions_1.Command.adminWelfare);
//Call /adminbday
bot.command('adminbday', functions_1.Command.adminbday);
//Call /adminsf
bot.command('adminsf', functions_1.Command.adminsf);
//Call /adminattendance
bot.command('adminattendance', functions_1.Command.adminattendance);
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
// /sendattendance Callbacks
bot.callbackQuery(/^svcLGAttendance/g, functions_1.sendAttendanceCallback.sendAttendanceReply);
bot.callbackQuery('yesWeAttendance', functions_1.sendAttendanceCallback.noLG_yes);
bot.callbackQuery('noWeAttendance', functions_1.sendAttendanceCallback.noLG_no_1);
bot.callbackQuery('yesLGAttendance', functions_1.sendAttendanceCallback.withLG_yesLG);
bot.callbackQuery('noLGAttendance', functions_1.sendAttendanceCallback.withLG_noLG_1);
// /adminWelfare Callbacks
//See Wish Callbacks
bot.callbackQuery('seeWelfareWishes', functions_1.adminWelfareCallback.seeWish_1);
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
// /adminbday Callbacks
//See Wish
bot.callbackQuery('seeBdayWishes', functions_1.adminbdayCallback.seeWish_1);
bot.callbackQuery(/^bdayWish_1-/g, functions_1.adminbdayCallback.seeWish_2);
//Birthday Reminder Mangement
bot.callbackQuery('manageBdayReminder', functions_1.adminbdayCallback.reminderManagement);
//Send to all not in birthday reminders
bot.callbackQuery('sendBdayNotInReminder', functions_1.adminbdayCallback.sendNotInReminder_1);
bot.callbackQuery(/^reminderBdayNotInEvents-/g, functions_1.adminbdayCallback.sendNotInReminder_2);
//Send sepecific Birthday Reminders
bot.callbackQuery('sendBdaySpecificReminder', functions_1.adminbdayCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderBdaySpecificEvents-/g, functions_1.adminbdayCallback.sendSpecificReminder_2);
bot.callbackQuery(/^reminderBdaySpecificNames-/g, functions_1.adminbdayCallback.sendSpecificReminder_3);
//Manage Birthday events
bot.callbackQuery('manageBdayEvent', functions_1.adminbdayCallback.manageEvent);
//See Birthday Events
bot.callbackQuery('seeBdayEvents', functions_1.adminbdayCallback.seeEvents);
//Add Birthday events
bot.callbackQuery('addBdayEvent', functions_1.adminbdayCallback.addBdayEvent_1);
bot.callbackQuery(/^nameAddBdayEvent-/g, functions_1.adminbdayCallback.addBdayEvent_4);
//Delete Birthday Event
bot.callbackQuery('deleteBdayEvent', functions_1.adminbdayCallback.deleteEvent_1);
bot.callbackQuery(/^delBdayEvent-/g, functions_1.adminbdayCallback.deleteEvent_2);
bot.callbackQuery('yesBdayDelEvent', functions_1.adminbdayCallback.deleteEvent_Yes);
bot.callbackQuery('noBdayDelEvent', functions_1.adminbdayCallback.deleteEvent_No);
//Edit Birthday event
bot.callbackQuery('editBdayEvent', functions_1.adminbdayCallback.editEvent);
bot.callbackQuery(/^editBdayEvent-/g, functions_1.adminbdayCallback.editEventMenu);
bot.callbackQuery('editBdayEventName', functions_1.adminbdayCallback.editEventName_1);
bot.callbackQuery('editBdayEventDate', functions_1.adminbdayCallback.editEventDate_1);
bot.callbackQuery('editBdayNotAllowedUser', functions_1.adminbdayCallback.editNotAllowedUser_1);
bot.callbackQuery(/^editBdayNotAllowedUser-/g, functions_1.adminbdayCallback.editNotAllowedUser_2);
//Manage Birthday Team
bot.callbackQuery('manageBdayTeam', functions_1.adminbdayCallback.manageTeam);
//Add Birthday Member
bot.callbackQuery('addWBdayMember', functions_1.adminbdayCallback.addMember_1);
bot.callbackQuery(/^addBdayMember-/g, functions_1.adminbdayCallback.addMember_2);
//Delete Birthday Member
bot.callbackQuery('delBdayMember', functions_1.adminbdayCallback.delMember_1);
bot.callbackQuery(/^delBdayMember-/g, functions_1.adminbdayCallback.delMember_2);
//Edit Birthday Team
bot.callbackQuery('editBdayMember', functions_1.adminbdayCallback.editMember_1);
bot.callbackQuery(/^editBdayMember-/g, functions_1.adminbdayCallback.editMember_2);
// /adminsf Callbacks
bot.callbackQuery('manageSFReminder', functions_1.adminSFCallback.reminderManagement);
bot.callbackQuery('sendSFNotInReminder', functions_1.adminSFCallback.sendNotInReminder_1);
bot.callbackQuery('sendSFSpecificReminder', functions_1.adminSFCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderSFSpecificNames-/g, functions_1.adminSFCallback.sendSpecificReminder_2);
// /adminattendance Callbacks
bot.callbackQuery('addAttendanceSheet', functions_1.adminAttendanceCallback.addAttendanceSheet);
bot.callbackQuery('yesLGAddAttendance', functions_1.adminAttendanceCallback.addAttendanceSheet_Yes_1);
bot.callbackQuery('noLGAddAttendance', functions_1.adminAttendanceCallback.addAttendanceSheet_No_1);
bot.callbackQuery('delAttendanceSheet', functions_1.adminAttendanceCallback.delAttendanceSheet);
bot.callbackQuery(/^delAttendanceeSheet-/g, functions_1.adminAttendanceCallback.confirmDelete);
bot.callbackQuery('yesCfmDelAttendanceSheet', functions_1.adminAttendanceCallback.yesDelete);
bot.callbackQuery('noCfmDelAttendanceSheet', functions_1.adminAttendanceCallback.noDelete);
//Attendance reminders callbacks
bot.callbackQuery('manageAttendanceReminder', functions_1.adminAttendanceCallback.reminderManagement);
//Send not in reminder (attendance)
bot.callbackQuery('sendAttendanceNotInReminder', functions_1.adminAttendanceCallback.sendNotInReminder_1);
bot.callbackQuery(/^notInReminderAttendance-/g, functions_1.adminAttendanceCallback.sendNotInReminder_3);
//Send specific reminder (attendance)
bot.callbackQuery('sendAttendanceSpecificReminder', functions_1.adminAttendanceCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderAttendanceSpecificNames-/g, functions_1.adminAttendanceCallback.sendSpecificReminder_2);
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', functions_1.botOnFunctions.botOnContext); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.
// Start the bot.
bot.start();
exports.default = (0, grammy_1.webhookCallback)(bot, 'http');
