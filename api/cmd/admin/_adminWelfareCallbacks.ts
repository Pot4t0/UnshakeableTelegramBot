import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { Database } from '../../database_mongoDB/_db-init';
import { Events } from '../../database_mongoDB/Entity/_tableEntity';
import {
  eventDB,
  reminder,
  team,
  wish,
} from '../../database_mongoDB/functions/_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

export const adminWelfare = (bot: Bot<BotContext>) => {
  //Wish View Callbacks
  wish.wishView(bot, 'Welfare');

  //Welfare Event Management
  eventDB.eventManagement(bot, 'Welfare');

  //Welfare Team Management
  team.teamManagement(bot, 'Welfare');

  //Welfare Reminder Mangement
  bot.callbackQuery('manageWelfareReminder', loadFunction, reminderSystem);
  bot.callbackQuery(/^sendWelfareReminder-/g, loadFunction, reminder_Menu);
  bot.callbackQuery('sendReminder-Welfare', loadFunction, reminder_Msg);
};

// Reminder Management
//Choose which event to send reminder for
const reminderSystem = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const event = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `sendWelfareReminder-${n.eventName}`,
      },
    ])
  );
  await ctx.reply(
    `Choose which event you want to send reminder for:
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
//Choose which reminder to send (Not In / Specific)
const reminder_Menu = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const title = ctx.update.callback_query.data.substring(
    'sendWelfareReminder-'.length
  );
  ctx.session.name = title;
  await reminder.reminderMenu(ctx, 'Welfare');
};
//Send Not In Reminder Messaage
const reminder_Msg = async (ctx: CallbackQueryContext<BotContext>) => {
  await reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};
