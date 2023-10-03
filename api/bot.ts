import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session, webhookCallback } from 'grammy';
import { initial } from './models/_SessionData';
import { BotContext } from './app/_index';
import {
  Command,
  adminAttendanceCallback,
  adminSFCallback,
  adminWelfareCallback,
  adminbdayCallback,
  botOnFunctions,
  sendAttendanceCallback,
  sendWishCallback,
  sendsfFunctions,
  startCallback,
} from './functions/_index';

const token = process.env.BOT_TOKEN || '';
// Create an instance of the `Bot` class and pass your bot token to it.

const bot = new Bot<BotContext>(token); // <-- put your bot token between the ""
if (!token) throw new Error('BOT_TOKEN is unset');

bot.use(session({ initial }));

//Initialise Commands
//Call /start command
bot.command('start', Command.start);
//Call /help command
bot.command('help', Command.help);
//Call /settings command
bot.command('settings', Command.settings);
//Call /sendsf command
bot.command('sendsf', Command.sendsf);
//Call /sendwish command
bot.command('sendwish', Command.sendWish);
//Call /attendance
bot.command('sendattendance', Command.sendattendance);
//Call /adminWelfare command
bot.command('adminwelfare', Command.adminWelfare);
//Call /adminbday
bot.command('adminbday', Command.adminbday);
//Call /adminsf
bot.command('adminsf', Command.adminsf);
//Call /adminattendance
bot.command('adminattendance', Command.adminattendance);

//Initiallise Callbacks
// /start Callbacks
bot.callbackQuery(/^nameStart-/g, startCallback.startReply);
bot.callbackQuery('confirm_YES', startCallback.confirmReply_Yes);
bot.callbackQuery('select_YES', startCallback.confirmReply_Yes);
bot.callbackQuery('confirm_NO', startCallback.confirmReply_No);
bot.callbackQuery('select_NO', startCallback.selectreply_No);

// /sendsf Callbacks
bot.callbackQuery('AttendanceSF-yes', sendsfFunctions.sendSfEvent_1);
bot.callbackQuery('AttendanceSF-no', sendsfFunctions.sendSfEvent_1_no);

// /sendwish Callbacks
bot.callbackQuery(/^eventName-/g, sendWishCallback.EventReply);

// /sendattendance Callbacks
bot.callbackQuery(
  /^svcLGAttendance/g,
  sendAttendanceCallback.sendAttendanceReply
);
bot.callbackQuery('yesWeAttendance', sendAttendanceCallback.noLG_yes);
bot.callbackQuery('noWeAttendance', sendAttendanceCallback.noLG_no_1);
bot.callbackQuery('yesLGAttendance', sendAttendanceCallback.withLG_yesLG);
bot.callbackQuery('noLGAttendance', sendAttendanceCallback.withLG_noLG_1);
bot.callbackQuery(
  'yesSpecialAttendance',
  sendAttendanceCallback.yesSpecialAttendance
);
bot.callbackQuery(
  'noSpecialAttendance',
  sendAttendanceCallback.noSpecialAttendance_1
);
bot.callbackQuery(
  /^dinnerAttendance-/g,
  sendAttendanceCallback.dinnerAttendance
);

// /adminWelfare Callbacks
//See Wish Callbacks
bot.callbackQuery('seeWelfareWishes', adminWelfareCallback.seeWish_1);
bot.callbackQuery(/^welfareWish_1-/g, adminWelfareCallback.seeWish_2);
//Welfare Event Management
bot.callbackQuery(
  'manageWelfareEvent',
  adminWelfareCallback.manageWelfareEvent
);
//See Welfare Events
bot.callbackQuery('seeWelfareEvents', adminWelfareCallback.seeWelfareEvents);
//Add Welfare Event
bot.callbackQuery('addWelfareEvent', adminWelfareCallback.addWelfareEvent_1);
bot.callbackQuery(
  /^nameAddWelfareEvent-/g,
  adminWelfareCallback.addWelfareEvent_4
);
//Delete Welfare Event
bot.callbackQuery(
  'deleteWelfareEvent',
  adminWelfareCallback.deleteWelfareEvent_1
);
bot.callbackQuery(
  /^delWelfareEvent-/g,
  adminWelfareCallback.deleteWelfareEvent_2
);
bot.callbackQuery(
  'yesWelfareDelEvent',
  adminWelfareCallback.deleteWelfareEvent_Yes
);
bot.callbackQuery(
  'noWelfareDelEvent',
  adminWelfareCallback.deleteWelfareEvent_No
);
//Edit Welfare Event
bot.callbackQuery('editWelfareEvent', adminWelfareCallback.editWelfareEvent);
bot.callbackQuery(
  /^editWelfareEvent-/g,
  adminWelfareCallback.editWelfareEventMenu
);
bot.callbackQuery(
  'editWelfareEventName',
  adminWelfareCallback.editWelfareEventName_1
);
bot.callbackQuery(
  'editWelfareEventDate',
  adminWelfareCallback.editWelfareEventDate_1
);
bot.callbackQuery(
  'editWelfareNotAllowedUser',
  adminWelfareCallback.editWelfareNotAllowedUser_1
);
bot.callbackQuery(
  /^editNotAllowedUser-/g,
  adminWelfareCallback.editWelfareNotAllowedUser_2
);

//Welfare Team Management
bot.callbackQuery('manageWelfareTeam', adminWelfareCallback.manageWelfareTeam);
//Add Member
bot.callbackQuery('addWelfareMember', adminWelfareCallback.addWelfareMember_1);
bot.callbackQuery(
  /^addWelfareMember-/g,
  adminWelfareCallback.addWelfareMember_2
);
//Delete Member
bot.callbackQuery('delWelfareMember', adminWelfareCallback.delWelfareMember_1);
bot.callbackQuery(
  /^delWelfareMember-/g,
  adminWelfareCallback.delWelfareMember_2
);
//Edit Member
bot.callbackQuery(
  'editWelfareMember',
  adminWelfareCallback.editWelfareMember_1
);
bot.callbackQuery(
  /^editWelfareMember-/g,
  adminWelfareCallback.editWelfareMember_2
);

//Welfare Reminder Mangement
bot.callbackQuery('manageReminder', adminWelfareCallback.reminderManagement);
bot.callbackQuery(
  'sendNotInReminder',
  adminWelfareCallback.sendNotInReminder_1
);
bot.callbackQuery(
  /^reminderNotInEvents-/g,
  adminWelfareCallback.sendNotInReminder_2
);
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

// /adminbday Callbacks
//See Wish
bot.callbackQuery('seeBdayWishes', adminbdayCallback.seeWish_1);
bot.callbackQuery(/^bdayWish_1-/g, adminbdayCallback.seeWish_2);

//Birthday Reminder Mangement
bot.callbackQuery('manageBdayReminder', adminbdayCallback.reminderManagement);
//Send to all not in birthday reminders
bot.callbackQuery(
  'sendBdayNotInReminder',
  adminbdayCallback.sendNotInReminder_1
);
bot.callbackQuery(
  /^reminderBdayNotInEvents-/g,
  adminbdayCallback.sendNotInReminder_2
);
//Send sepecific Birthday Reminders
bot.callbackQuery(
  'sendBdaySpecificReminder',
  adminbdayCallback.sendSpecificReminder_1
);
bot.callbackQuery(
  /^reminderBdaySpecificEvents-/g,
  adminbdayCallback.sendSpecificReminder_2
);
bot.callbackQuery(
  /^reminderBdaySpecificNames-/g,
  adminbdayCallback.sendSpecificReminder_3
);
//Manage Birthday events
bot.callbackQuery('manageBdayEvent', adminbdayCallback.manageEvent);
//See Birthday Events
bot.callbackQuery('seeBdayEvents', adminbdayCallback.seeEvents);
//Add Birthday events
bot.callbackQuery('addBdayEvent', adminbdayCallback.addBdayEvent_1);
bot.callbackQuery(/^nameAddBdayEvent-/g, adminbdayCallback.addBdayEvent_4);
//Delete Birthday Event
bot.callbackQuery('deleteBdayEvent', adminbdayCallback.deleteEvent_1);
bot.callbackQuery(/^delBdayEvent-/g, adminbdayCallback.deleteEvent_2);
bot.callbackQuery('yesBdayDelEvent', adminbdayCallback.deleteEvent_Yes);
bot.callbackQuery('noBdayDelEvent', adminbdayCallback.deleteEvent_No);
//Edit Birthday event
bot.callbackQuery('editBdayEvent', adminbdayCallback.editEvent);
bot.callbackQuery(/^editBdayEvent-/g, adminbdayCallback.editEventMenu);
bot.callbackQuery('editBdayEventName', adminbdayCallback.editEventName_1);
bot.callbackQuery('editBdayEventDate', adminbdayCallback.editEventDate_1);
bot.callbackQuery(
  'editBdayNotAllowedUser',
  adminbdayCallback.editNotAllowedUser_1
);
bot.callbackQuery(
  /^editBdayNotAllowedUser-/g,
  adminbdayCallback.editNotAllowedUser_2
);
//Manage Birthday Team
bot.callbackQuery('manageBdayTeam', adminbdayCallback.manageTeam);
//Add Birthday Member
bot.callbackQuery('addWBdayMember', adminbdayCallback.addMember_1);
bot.callbackQuery(/^addBdayMember-/g, adminbdayCallback.addMember_2);
//Delete Birthday Member
bot.callbackQuery('delBdayMember', adminbdayCallback.delMember_1);
bot.callbackQuery(/^delBdayMember-/g, adminbdayCallback.delMember_2);
//Edit Birthday Team
bot.callbackQuery('editBdayMember', adminbdayCallback.editMember_1);
bot.callbackQuery(/^editBdayMember-/g, adminbdayCallback.editMember_2);

// /adminsf Callbacks
bot.callbackQuery('manageSFReminder', adminSFCallback.reminderManagement);
bot.callbackQuery('sendSFNotInReminder', adminSFCallback.sendNotInReminder_1);
bot.callbackQuery(
  'sendSFSpecificReminder',
  adminSFCallback.sendSpecificReminder_1
);
bot.callbackQuery(
  /^reminderSFSpecificNames-/g,
  adminSFCallback.sendSpecificReminder_2
);
bot.callbackQuery('manualSF', adminSFCallback.manualSF);
bot.callbackQuery(/^manualSFName-/g, adminSFCallback.sendsf);
bot.callbackQuery(/^manualSendSF-/g, adminSFCallback.manualSFYesNo);

// /adminattendance Callbacks
bot.callbackQuery(
  'addAttendanceSheet',
  adminAttendanceCallback.addAttendanceSheet
);
bot.callbackQuery(
  'yesLGAddAttendance',
  adminAttendanceCallback.addAttendanceSheet_Yes_1
);
bot.callbackQuery(
  'noLGAddAttendance',
  adminAttendanceCallback.addAttendanceSheet_No_1
);
bot.callbackQuery(
  'specialAddAttendance',
  adminAttendanceCallback.specialAddAttendance_1
);
bot.callbackQuery(
  'delAttendanceSheet',
  adminAttendanceCallback.delAttendanceSheet
);
bot.callbackQuery(
  /^delAttendanceeSheet-/g,
  adminAttendanceCallback.confirmDelete
);
bot.callbackQuery(
  'yesCfmDelAttendanceSheet',
  adminAttendanceCallback.yesDelete
);
bot.callbackQuery('noCfmDelAttendanceSheet', adminAttendanceCallback.noDelete);
//Attendance reminders callbacks
bot.callbackQuery(
  'manageAttendanceReminder',
  adminAttendanceCallback.reminderManagement
);
//Send not in reminder (attendance)
bot.callbackQuery(
  'sendAttendanceNotInReminder',
  adminAttendanceCallback.sendNotInReminder_1
);
bot.callbackQuery(
  /^notInReminderAttendance-/g,
  adminAttendanceCallback.sendNotInReminder_3
);
//Send specific reminder (attendance)
bot.callbackQuery(
  'sendAttendanceSpecificReminder',
  adminAttendanceCallback.sendSpecificReminder_1
);
bot.callbackQuery(
  /^reminderAttendanceSpecificNames-/g,
  adminAttendanceCallback.sendSpecificReminder_2
);

bot.callbackQuery('chatAttendance', adminAttendanceCallback.selectSvcDateChat);
bot.callbackQuery(
  /^selectSvcDateChat-/g,
  adminAttendanceCallback.sendAttendanceToLGChat
);

// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
bot.on('message', botOnFunctions.botOnContext); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.
// Start the bot.
// bot.start();

export default webhookCallback(bot, 'http');
