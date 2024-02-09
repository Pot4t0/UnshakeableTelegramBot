"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminBday = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _telefunctions_1 = require("../../app/_telefunctions");
const adminBday = (bot) => {
    //Birthday View Callbacks
    _index_1.wish.wishView(bot, 'Birthday');
    //Birthday Event Management
    _index_1.eventDB.eventManagement(bot, 'Birthday');
    //Birthday Team Management
    _index_1.team.teamManagement(bot, 'Birthday');
    //Birthday Reminder Mangement
    bot.callbackQuery('manageBirthdayReminder', _telefunctions_1.loadFunction, reminderSystem);
    bot.callbackQuery(/^sendBirthdayReminder-/g, _telefunctions_1.loadFunction, reminder_Menu);
    bot.callbackQuery('sendReminder-Birthday', _telefunctions_1.loadFunction, reminder_Msg);
};
exports.adminBday = adminBday;
// Reminder Management
//Choose which event to send reminder for
const reminderSystem = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let msg;
    if (ctx.message)
        yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const event = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `sendBirthdayReminder-${n.eventName}`,
        },
    ]));
    yield ctx.reply(`Choose which event you want to send reminder for:
		  `, {
        reply_markup: inlineKeyboard,
    });
});
//Choose which reminder to send (Not In / Specific)
const reminder_Menu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const title = ctx.update.callback_query.data.substring('sendBirthdayReminder-'.length);
    ctx.session.name = title;
    yield _index_1.reminder.reminderMenu(ctx, 'Birthday');
});
//Send Not In Reminder Messaage
const reminder_Msg = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield _index_1.reminder.reminderSendAllNotIn_ReminderMessage(ctx);
});
