"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const grammy_1 = require("grammy");
const _SessionData_1 = require("./models/_SessionData");
const _index_1 = require("./functions/_index");
const token = process.env.BOT_TOKEN || '';
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new grammy_1.Bot(token); // <-- put your bot token between the ""
if (!token)
    throw new Error('BOT_TOKEN is unset');
bot.use((0, grammy_1.session)({ initial: _SessionData_1.initial }));
//Initialise Commands
//Call /start command
bot.command('start', _index_1.Command.start);
//Call /help command
bot.command('help', _index_1.Command.help);
//Call /settings command
bot.command('settings', _index_1.Command.settings);
//Call /sendsf command
bot.command('sendsf', _index_1.Command.sendsf);
//Call /sendwish command
bot.command('sendwish', _index_1.Command.sendWish);
//Call /attendance
bot.command('sendattendance', _index_1.Command.sendattendance);
//Call /adminWelfare command
bot.command('adminwelfare', _index_1.Command.adminWelfare);
//Call /adminbday
bot.command('adminbday', _index_1.Command.adminbday);
//Call /adminsf
bot.command('adminsf', _index_1.Command.adminsf);
//Call /adminattendance
bot.command('adminattendance', _index_1.Command.adminattendance);
//Initiallise Callbacks
// /start Callbacks
bot.callbackQuery(/^nameStart-/g, _index_1.startCallback.startReply);
bot.callbackQuery('confirm_YES', _index_1.startCallback.confirmReply_Yes);
bot.callbackQuery('select_YES', _index_1.startCallback.confirmReply_Yes);
bot.callbackQuery('confirm_NO', _index_1.startCallback.confirmReply_No);
bot.callbackQuery('select_NO', _index_1.startCallback.selectreply_No);
// /sendsf Callbacks
bot.callbackQuery('AttendanceSF-yes', _index_1.sendsfFunctions.sendSfEvent_1);
bot.callbackQuery('AttendanceSF-no', _index_1.sendsfFunctions.sendSfEvent_1_no);
// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, _index_1.sendWishCallback.EventReply);
// /sendattendance Callbacks
bot.callbackQuery(/^svcLGAttendance/g, _index_1.sendAttendanceCallback.sendAttendanceReply);
bot.callbackQuery('yesWeAttendance', _index_1.sendAttendanceCallback.noLG_yes);
bot.callbackQuery('noWeAttendance', _index_1.sendAttendanceCallback.noLG_no_1);
bot.callbackQuery('yesLGAttendance', _index_1.sendAttendanceCallback.withLG_yesLG);
bot.callbackQuery('noLGAttendance', _index_1.sendAttendanceCallback.withLG_noLG_1);
// /adminWelfare Callbacks
//See Wish Callbacks
bot.callbackQuery('seeWelfareWishes', _index_1.adminWelfareCallback.seeWish_1);
bot.callbackQuery(/^welfareWish_1-/g, _index_1.adminWelfareCallback.seeWish_2);
//Welfare Event Management
bot.callbackQuery('manageWelfareEvent', _index_1.adminWelfareCallback.manageWelfareEvent);
//See Welfare Events
bot.callbackQuery('seeWelfareEvents', _index_1.adminWelfareCallback.seeWelfareEvents);
//Add Welfare Event
bot.callbackQuery('addWelfareEvent', _index_1.adminWelfareCallback.addWelfareEvent_1);
bot.callbackQuery(/^nameAddWelfareEvent-/g, _index_1.adminWelfareCallback.addWelfareEvent_4);
//Delete Welfare Event
bot.callbackQuery('deleteWelfareEvent', _index_1.adminWelfareCallback.deleteWelfareEvent_1);
bot.callbackQuery(/^delWelfareEvent-/g, _index_1.adminWelfareCallback.deleteWelfareEvent_2);
bot.callbackQuery('yesWelfareDelEvent', _index_1.adminWelfareCallback.deleteWelfareEvent_Yes);
bot.callbackQuery('noWelfareDelEvent', _index_1.adminWelfareCallback.deleteWelfareEvent_No);
//Edit Welfare Event
bot.callbackQuery('editWelfareEvent', _index_1.adminWelfareCallback.editWelfareEvent);
bot.callbackQuery(/^editWelfareEvent-/g, _index_1.adminWelfareCallback.editWelfareEventMenu);
bot.callbackQuery('editWelfareEventName', _index_1.adminWelfareCallback.editWelfareEventName_1);
bot.callbackQuery('editWelfareEventDate', _index_1.adminWelfareCallback.editWelfareEventDate_1);
bot.callbackQuery('editWelfareNotAllowedUser', _index_1.adminWelfareCallback.editWelfareNotAllowedUser_1);
bot.callbackQuery(/^editNotAllowedUser-/g, _index_1.adminWelfareCallback.editWelfareNotAllowedUser_2);
//Welfare Team Management
bot.callbackQuery('manageWelfareTeam', _index_1.adminWelfareCallback.manageWelfareTeam);
//Add Member
bot.callbackQuery('addWelfareMember', _index_1.adminWelfareCallback.addWelfareMember_1);
bot.callbackQuery(/^addWelfareMember-/g, _index_1.adminWelfareCallback.addWelfareMember_2);
//Delete Member
bot.callbackQuery('delWelfareMember', _index_1.adminWelfareCallback.delWelfareMember_1);
bot.callbackQuery(/^delWelfareMember-/g, _index_1.adminWelfareCallback.delWelfareMember_2);
//Edit Member
bot.callbackQuery('editWelfareMember', _index_1.adminWelfareCallback.editWelfareMember_1);
bot.callbackQuery(/^editWelfareMember-/g, _index_1.adminWelfareCallback.editWelfareMember_2);
//Welfare Reminder Mangement
bot.callbackQuery('manageReminder', _index_1.adminWelfareCallback.reminderManagement);
bot.callbackQuery('sendNotInReminder', _index_1.adminWelfareCallback.sendNotInReminder_1);
bot.callbackQuery(/^reminderNotInEvents-/g, _index_1.adminWelfareCallback.sendNotInReminder_2);
bot.callbackQuery('sendSpecificReminder', _index_1.adminWelfareCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderSpecificEvents-/g, _index_1.adminWelfareCallback.sendSpecificReminder_2);
bot.callbackQuery(/^reminderSpecificNames-/g, _index_1.adminWelfareCallback.sendSpecificReminder_3);
// /adminbday Callbacks
//See Wish
bot.callbackQuery('seeBdayWishes', _index_1.adminbdayCallback.seeWish_1);
bot.callbackQuery(/^bdayWish_1-/g, _index_1.adminbdayCallback.seeWish_2);
//Birthday Reminder Mangement
bot.callbackQuery('manageBdayReminder', _index_1.adminbdayCallback.reminderManagement);
//Send to all not in birthday reminders
bot.callbackQuery('sendBdayNotInReminder', _index_1.adminbdayCallback.sendNotInReminder_1);
bot.callbackQuery(/^reminderBdayNotInEvents-/g, _index_1.adminbdayCallback.sendNotInReminder_2);
//Send sepecific Birthday Reminders
bot.callbackQuery('sendBdaySpecificReminder', _index_1.adminbdayCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderBdaySpecificEvents-/g, _index_1.adminbdayCallback.sendSpecificReminder_2);
bot.callbackQuery(/^reminderBdaySpecificNames-/g, _index_1.adminbdayCallback.sendSpecificReminder_3);
//Manage Birthday events
bot.callbackQuery('manageBdayEvent', _index_1.adminbdayCallback.manageEvent);
//See Birthday Events
bot.callbackQuery('seeBdayEvents', _index_1.adminbdayCallback.seeEvents);
//Add Birthday events
bot.callbackQuery('addBdayEvent', _index_1.adminbdayCallback.addBdayEvent_1);
bot.callbackQuery(/^nameAddBdayEvent-/g, _index_1.adminbdayCallback.addBdayEvent_4);
//Delete Birthday Event
bot.callbackQuery('deleteBdayEvent', _index_1.adminbdayCallback.deleteEvent_1);
bot.callbackQuery(/^delBdayEvent-/g, _index_1.adminbdayCallback.deleteEvent_2);
bot.callbackQuery('yesBdayDelEvent', _index_1.adminbdayCallback.deleteEvent_Yes);
bot.callbackQuery('noBdayDelEvent', _index_1.adminbdayCallback.deleteEvent_No);
//Edit Birthday event
bot.callbackQuery('editBdayEvent', _index_1.adminbdayCallback.editEvent);
bot.callbackQuery(/^editBdayEvent-/g, _index_1.adminbdayCallback.editEventMenu);
bot.callbackQuery('editBdayEventName', _index_1.adminbdayCallback.editEventName_1);
bot.callbackQuery('editBdayEventDate', _index_1.adminbdayCallback.editEventDate_1);
bot.callbackQuery('editBdayNotAllowedUser', _index_1.adminbdayCallback.editNotAllowedUser_1);
bot.callbackQuery(/^editBdayNotAllowedUser-/g, _index_1.adminbdayCallback.editNotAllowedUser_2);
//Manage Birthday Team
bot.callbackQuery('manageBdayTeam', _index_1.adminbdayCallback.manageTeam);
//Add Birthday Member
bot.callbackQuery('addWBdayMember', _index_1.adminbdayCallback.addMember_1);
bot.callbackQuery(/^addBdayMember-/g, _index_1.adminbdayCallback.addMember_2);
//Delete Birthday Member
bot.callbackQuery('delBdayMember', _index_1.adminbdayCallback.delMember_1);
bot.callbackQuery(/^delBdayMember-/g, _index_1.adminbdayCallback.delMember_2);
//Edit Birthday Team
bot.callbackQuery('editBdayMember', _index_1.adminbdayCallback.editMember_1);
bot.callbackQuery(/^editBdayMember-/g, _index_1.adminbdayCallback.editMember_2);
// /adminsf Callbacks
bot.callbackQuery('manageSFReminder', _index_1.adminSFCallback.reminderManagement);
bot.callbackQuery('sendSFNotInReminder', _index_1.adminSFCallback.sendNotInReminder_1);
bot.callbackQuery('sendSFSpecificReminder', _index_1.adminSFCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderSFSpecificNames-/g, _index_1.adminSFCallback.sendSpecificReminder_2);
// /adminattendance Callbacks
bot.callbackQuery('addAttendanceSheet', _index_1.adminAttendanceCallback.addAttendanceSheet);
bot.callbackQuery('yesLGAddAttendance', _index_1.adminAttendanceCallback.addAttendanceSheet_Yes_1);
bot.callbackQuery('noLGAddAttendance', _index_1.adminAttendanceCallback.addAttendanceSheet_No_1);
bot.callbackQuery('delAttendanceSheet', _index_1.adminAttendanceCallback.delAttendanceSheet);
bot.callbackQuery(/^delAttendanceeSheet-/g, _index_1.adminAttendanceCallback.confirmDelete);
bot.callbackQuery('yesCfmDelAttendanceSheet', _index_1.adminAttendanceCallback.yesDelete);
bot.callbackQuery('noCfmDelAttendanceSheet', _index_1.adminAttendanceCallback.noDelete);
//Attendance reminders callbacks
bot.callbackQuery('manageAttendanceReminder', _index_1.adminAttendanceCallback.reminderManagement);
//Send not in reminder (attendance)
bot.callbackQuery('sendAttendanceNotInReminder', _index_1.adminAttendanceCallback.sendNotInReminder_1);
bot.callbackQuery(/^notInReminderAttendance-/g, _index_1.adminAttendanceCallback.sendNotInReminder_3);
//Send specific reminder (attendance)
bot.callbackQuery('sendAttendanceSpecificReminder', _index_1.adminAttendanceCallback.sendSpecificReminder_1);
bot.callbackQuery(/^reminderAttendanceSpecificNames-/g, _index_1.adminAttendanceCallback.sendSpecificReminder_2);
bot.callbackQuery('chatAttendance', _index_1.adminAttendanceCallback.selectSvcDateChat);
bot.callbackQuery(/^selectSvcDateChat-/g, _index_1.adminAttendanceCallback.sendAttendanceToLGChat);
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', _index_1.botOnFunctions.botOnContext); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.
// Start the bot.
// bot.start();
exports.default = (0, grammy_1.webhookCallback)(bot, 'http');
