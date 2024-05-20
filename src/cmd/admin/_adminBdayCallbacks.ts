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

/**
 * /adminBday
 * - Sets up callback query handlers for the Birthday command.
 * - This function registers callback queries for the Birthday command.
 * @param bot The Bot instance.
 */
export const adminBday = (bot: Bot<BotContext>) => {
  //Birthday View Callbacks
  wish.wishView(bot, 'Birthday');

  //Birthday Event Management
  eventDB.eventManagement(bot, 'Birthday');

  //Birthday Team Management
  team.teamManagement(bot, 'Birthday');

  //Birthday Reminder Mangement
  bot.callbackQuery('manageBirthdayReminder', loadFunction, reminderSystem);
  bot.callbackQuery(/^sendBirthdayReminder-/g, loadFunction, reminder_Menu);
  bot.callbackQuery('sendReminder-Birthday', loadFunction, reminder_Msg);
};

/**
 * Birthday Reminder System
 * - Sends a list of events to choose from.
 * @param ctx The message context.
 */
const reminderSystem = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const event = await Database.getMongoRepository(Events).find({
    eventTeam: 'Bday',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `sendBirthdayReminder-${n.eventName}`,
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
/**
 * Choose which reminder to send (Not In / Specific)
 * @param ctx The message context.
 * @throws Error if the reminder could not be sent.
 */
const reminder_Menu = async (ctx: CallbackQueryContext<BotContext>) => {
  const title = ctx.update.callback_query.data.substring(
    'sendBirthdayReminder-'.length
  );
  ctx.session.name = title;
  await reminder.reminderMenu(ctx, 'Birthday');
};
//Send Not In Reminder Messaage
const reminder_Msg = async (ctx: CallbackQueryContext<BotContext>) => {
  await reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};
