"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackQueryHandler = void 0;
const _index_1 = require("../cmd/start/_index");
const _index_2 = require("../cmd/settings/_index");
const _index_3 = require("../cmd/admin/_index"); //Bot Admin Commands
const _index_4 = require("../database_mongoDB/functions/_index");
const _index_5 = require("../cmd/send/_index");
/**
 * Handles callback queries from the bot.
 * @param {Bot<BotContext>} bot The bot instance.
 */
const callbackQueryHandler = (bot) => {
    // Bot Commands Callback
    // /start Callbacks
    (0, _index_1.start)(bot); // Executes start command callbacks
    // /settings Callbacks
    (0, _index_2.settings)(bot); // Executes settings command callbacks
    // /sendsf Callbacks
    _index_5.send.sf(bot); // Executes sendsf command callbacks
    // /sendwish Callbacks
    _index_5.send.wish(bot); // Executes sendwish command callbacks
    // /sendattendance Callbacks
    _index_5.send.attendance(bot); // Executes sendattendance command callbacks
    // /sendclaim Callbacks
    _index_5.send.claim(bot); // Executes sendclaim command callbacks
    // /adminWelfare Callbacks
    _index_3.admin.welfare(bot); // Executes adminWelfare command callbacks
    // /adminbday Callbacks
    _index_3.admin.bday(bot); // Executes adminbday command callbacks
    // /adminsf Callbacks
    _index_3.admin.sf(bot); // Executes adminsf command callbacks
    // /adminattendance Callbacks
    _index_3.admin.attendance(bot); // Executes adminattendance command callbacks
    // /adminfinance Callbacks
    _index_3.admin.finance(bot); // Executes adminfinance command callbacks
    // DB Callbacks
    //Specific Person Reminder
    _index_4.reminder.specificReminder(bot); // Executes specificReminder callbacks
};
exports.callbackQueryHandler = callbackQueryHandler;
