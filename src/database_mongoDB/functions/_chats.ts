import { Bot, CallbackQueryContext, Filter, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';
import { Database } from '../_db-init';
import { Settings } from '../Entity/_tableEntity';

/**
 * Sets up callback query handlers for choosing a chat associated with a specific group.
 * This function registers callback queries for changing the chat associated with either the LG or Finance group.
 * @param bot The Bot instance.
 * @param grp The group parameter, which can be either 'LG' or 'Finance'.
 */
export const chooseChat = async (
  bot: Bot<BotContext>,
  grp: 'LG'
  // | 'Finance'
) => {
  bot.callbackQuery(`changeChat${grp}`, loadFunction, async (ctx) => {
    await changeChat(ctx, grp);
  });
};

/**
 * Handles the logic for changing the chat associated with a specific group.
 * This function displays a keyboard for selecting a chat when a user clicks on a callback button.
 * @param ctx The callback query context.
 * @param grp The group parameter, which can be either 'LG' or 'Finance'.
 */
const changeChat = async (
  ctx: CallbackQueryContext<BotContext>,
  grp: 'LG'
  // | 'Finance'
) => {
  // Remove any existing inline buttons
  await removeInLineButton(ctx);

  // Create a keyboard with a request to choose the chat
  const button = new Keyboard()
    .requestChat(`Choose ${grp} Chat`, 1)
    .oneTime(true);

  // Store the group parameter in the session data
  ctx.session.text = grp;

  // Send a message prompting the user to choose a chat
  await ctx.reply(
    `Choose the updated ${grp} Chat. It will let the Bot enter the chat and send messages.`,
    {
      reply_markup: button,
    }
  );
};

/**
 * Executes the chat change process after a chat is selected.
 * This function updates the database with the new chat ID and notifies the user about the change.
 * @param ctx The filter for chat shared events.
 */
export const changeChatExecution = async (
  ctx: Filter<BotContext, ':chat_shared'>
) => {
  const chatid = ctx.update.message?.chat_shared.chat_id;
  const grp = ctx.session.text;

  if (chatid && grp) {
    // Retrieve chat details from the database
    const lgDetailsArr = await Database.getMongoRepository(Settings).findOneBy({
      option: 'LG',
    });

    if (!lgDetailsArr) {
      // Handle error if chat details are not found in the database
      await ctx.reply('ERROR! Did not initialise chat ids for lg');
    } else {
      // Extract chat details and update the appropriate chat ID based on the group
      const lgDetails = lgDetailsArr.config;
      switch (grp) {
        case 'LG':
          lgDetails[0] = chatid.toString();
          process.env.LG_CHATID = chatid.toString();
          break;
        // case 'Finance':
        //   lgDetails[1] = chatid.toString();
        //   process.env.LG_FINANCE_CLAIM = chatid.toString();
        //   break;
        default:
          await ctx.reply('ERROR! No grp found!');
          return;
      }

      // Update the database with the new chat details
      await Database.getMongoRepository(Settings).updateOne(
        { option: 'LG' },
        { $set: { config: lgDetails } }
      );
    }

    // Notify the user about the successful chat change
    await ctx.reply(
      `LG Chat changed to ${chatid} Remember to add bot to the chat!`
    );
  } else {
    // Handle error if chat ID or group parameter is missing
    await ctx.reply('Error! Please try again!');
  }
};
