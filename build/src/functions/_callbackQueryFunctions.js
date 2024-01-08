"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackQueryHandler = void 0;
const _index_1 = require("../cmd/start/_index");
const _index_2 = require("../cmd/settings/_index");
const _index_3 = require("../cmd/admin/_index"); //Bot Admin Commands
const _index_4 = require("../database_mongoDB/functions/_index");
const _index_5 = require("../cmd/send/_index");
const callbackQueryHandler = (bot) => {
    // Bot Commands Callback
    // /start Callbacks
    (0, _index_1.start)(bot);
    // /settings Callbacks
    (0, _index_2.settings)(bot);
    // /sendsf Callbacks
    _index_5.send.sf(bot);
    // /sendwish Callbacks
    _index_5.send.wish(bot);
    // /sendattendance Callbacks
    _index_5.send.attendance(bot);
    // /adminWelfare Callbacks
    _index_3.admin.attendance(bot);
    // /adminbday Callbacks
    _index_3.admin.bday(bot);
    // /adminsf Callbacks
    _index_3.admin.sf(bot);
    // /adminattendance Callbacks
    _index_3.admin.attendance(bot);
    // DB Callbacks
    //Specific Person Reminder
    _index_4.reminder.specificReminder(bot);
};
exports.callbackQueryHandler = callbackQueryHandler;
