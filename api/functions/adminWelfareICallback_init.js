"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWelfareCallback_init = void 0;
const grammy_1 = require("grammy");
const _1 = require(".");
require("dotenv/config");
require("reflect-metadata");
const adminWelfareCallback_init = () => {
    const token = process.env.TOKEN || '';
    const bot = new grammy_1.Bot(token); // <-- put your bot token between the ""
    //See Wish Callbacks
    bot.callbackQuery('seeWelfareWishes', _1.adminWelfareCallback.seeWish_1);
    bot.callbackQuery(/^welfareWish_1-/g, _1.adminWelfareCallback.seeWish_2);
    //Welfare Event Management
    bot.callbackQuery('manageWelfareEvent', _1.adminWelfareCallback.manageWelfareEvent);
    //See Welfare Events
    bot.callbackQuery('seeWelfareEvents', _1.adminWelfareCallback.seeWelfareEvents);
    //Add Welfare Event
    bot.callbackQuery('addWelfareEvent', _1.adminWelfareCallback.addWelfareEvent_1);
    bot.callbackQuery(/^nameAddWelfareEvent-/g, _1.adminWelfareCallback.addWelfareEvent_4);
    //Delete Welfare Event
    bot.callbackQuery('deleteWelfareEvent', _1.adminWelfareCallback.deleteWelfareEvent_1);
    bot.callbackQuery(/^delWelfareEvent-/g, _1.adminWelfareCallback.deleteWelfareEvent_2);
    bot.callbackQuery('yesWelfareDelEvent', _1.adminWelfareCallback.deleteWelfareEvent_Yes);
    bot.callbackQuery('noWelfareDelEvent', _1.adminWelfareCallback.deleteWelfareEvent_No);
    //Edit Welfare Event
    bot.callbackQuery('editWelfareEvent', _1.adminWelfareCallback.editWelfareEvent);
    bot.callbackQuery(/^editWelfareEvent-/g, _1.adminWelfareCallback.editWelfareEventMenu);
    bot.callbackQuery('editWelfareEventName', _1.adminWelfareCallback.editWelfareEventName_1);
    bot.callbackQuery('editWelfareEventDate', _1.adminWelfareCallback.editWelfareEventDate_1);
    bot.callbackQuery('editWelfareNotAllowedUser', _1.adminWelfareCallback.editWelfareNotAllowedUser_1);
    bot.callbackQuery(/^editNotAllowedUser-/g, _1.adminWelfareCallback.editWelfareNotAllowedUser_2);
    //Welfare Team Management
    bot.callbackQuery('manageWelfareTeam', _1.adminWelfareCallback.manageWelfareTeam);
    //Add Member
    bot.callbackQuery('addWelfareMember', _1.adminWelfareCallback.addWelfareMember_1);
    bot.callbackQuery(/^addWelfareMember-/g, _1.adminWelfareCallback.addWelfareMember_2);
    //Delete Member
    bot.callbackQuery('delWelfareMember', _1.adminWelfareCallback.delWelfareMember_1);
    bot.callbackQuery(/^delWelfareMember-/g, _1.adminWelfareCallback.delWelfareMember_2);
    //Edit Member
    bot.callbackQuery('editWelfareMember', _1.adminWelfareCallback.editWelfareMember_1);
    bot.callbackQuery(/^editWelfareMember-/g, _1.adminWelfareCallback.editWelfareMember_2);
    //Welfare Reminder Mangement
    bot.callbackQuery('manageReminder', _1.adminWelfareCallback.reminderManagement);
    bot.callbackQuery('sendNotInReminder', _1.adminWelfareCallback.sendNotInReminder_1);
    bot.callbackQuery(/^reminderNotInEvents-/g, _1.adminWelfareCallback.sendNotInReminder_2);
    bot.callbackQuery('sendSpecificReminder', _1.adminWelfareCallback.sendSpecificReminder_1);
    bot.callbackQuery(/^reminderSpecificEvents-/g, _1.adminWelfareCallback.sendSpecificReminder_2);
    bot.callbackQuery(/^reminderSpecificNames-/g, _1.adminWelfareCallback.sendSpecificReminder_3);
};
exports.adminWelfareCallback_init = adminWelfareCallback_init;
