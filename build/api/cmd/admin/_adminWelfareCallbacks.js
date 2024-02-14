"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWelfare = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _telefunctions_1 = require("../../app/_telefunctions");
const adminWelfare = (bot) => {
    //Wish View Callbacks
    _index_1.wish.wishView(bot, 'Welfare');
    //Welfare Event Management
    _index_1.eventDB.eventManagement(bot, 'Welfare');
    //Welfare Team Management
    _index_1.team.teamManagement(bot, 'Welfare');
    //Welfare Reminder Mangement
    bot.callbackQuery('manageWelfareReminder', _telefunctions_1.loadFunction, reminderSystem);
    bot.callbackQuery(/^sendWelfareReminder-/g, _telefunctions_1.loadFunction, reminder_Menu);
    bot.callbackQuery('sendReminder-Welfare', _telefunctions_1.loadFunction, reminder_Msg);
};
exports.adminWelfare = adminWelfare;
// Reminder Management
//Choose which event to send reminder for
const reminderSystem = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const event = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `sendWelfareReminder-${n.eventName}`,
        },
    ]));
    await ctx.reply(`Choose which event you want to send reminder for:
		  `, {
        reply_markup: inlineKeyboard,
    });
};
//Choose which reminder to send (Not In / Specific)
const reminder_Menu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const title = ctx.update.callback_query.data.substring('sendWelfareReminder-'.length);
    ctx.session.name = title;
    await _index_1.reminder.reminderMenu(ctx, 'Welfare');
};
//Send Not In Reminder Messaage
const reminder_Msg = async (ctx) => {
    await _index_1.reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};
