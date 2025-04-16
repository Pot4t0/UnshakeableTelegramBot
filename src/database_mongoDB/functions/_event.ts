import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_context';
import { Database } from '../_db-init';
import { Events, Names, Wishes } from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

//Events Database - Contains all events
//Functions to manage events limited to each team (Birthday / Welfare)
//Add, Delete, Edit, View
//Add CallbackQuery: add{team}Events
//Delete CallbackQuery: del{team}Events
//Edit CallbackQuery: edit{team}Events
//View CallbackQuery: see{team}Events
export const eventManagement = async (
  bot: Bot<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  bot.callbackQuery(`manage${team}Event`, loadFunction, (ctx) =>
    eventManageMenu(ctx, team)
  );
  bot.callbackQuery(`see${team}Events`, loadFunction, (ctx) =>
    eventView(ctx, team)
  );
  addEvent(bot, team);
  delEvent(bot, team);
  editEvent(bot, team);
};
const eventManageMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: `List ${team} Events`,
        callback_data: `see${team}Events`,
      },
    ],
    [
      {
        text: `Add ${team} Event`,
        callback_data: `add${team}Events`,
      },
    ],
    [
      {
        text: `Delete ${team} Event`,
        callback_data: `del${team}Events`,
      },
    ],
    [
      {
        text: `Edit ${team} Event`,
        callback_data: `edit${team}Events`,
      },
    ],
  ]);
  await ctx.reply(
    `<b>${team} Event Management</b>\n\nSelect an option below:`,
    {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard,
    }
  );
};

/**
 * Displays all events for a specific team.
 * @param ctx The callback query context.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const eventView = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Welfare') {
    eventTeam = 'Welfare';
  } else {
    eventTeam = 'Bday';
  }
  const currentUser = ctx.callbackQuery.from.username;
  const allEvents = await Database.getMongoRepository(Events).find({
    eventTeam: eventTeam,
  });
  const currentUserName = await Database.getRepository(Names).findOneBy({
    teleUser: currentUser,
  });
  if (!currentUserName) {
    await ctx.reply(
      `You are not in the database. Please contact the admin to add you in the database`
    );
    return;
  }

  /**
   * The list of events for the specified team.
   * @type {string[]}
   * @returns The list of events for the specified team.
   */
  const eventListed = allEvents.map((n) => {
    if (currentUserName.nameText != n.notAllowedUser) {
      return `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`;
    }
  });

  await ctx.reply(eventListed.join('\n\n'));
};

/* 
  The following functions are used to add, delete, and edit events for the specified team.
  These functions are used in the eventManagement function.
*/

/**
 * Adds an event for the specified team.
 * @param bot The Bot instance.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const addEvent = async (bot: Bot<BotContext>, team: 'Welfare' | 'Birthday') => {
  bot.callbackQuery(`add${team}Events`, (ctx) => addEvent_Init(ctx, team));
  bot.callbackQuery(/^createEvent-/g, (ctx) =>
    addEvent_CreateEvent(
      ctx,
      ctx.update.callback_query.data.substring(`createEvent-`.length)
    )
  );
};

/**
 * Initializes the event creation process.
 * @param ctx The callback query context.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const addEvent_Init = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);

  ctx.session.name = team;
  ctx.reply(`Input ${team} event Name\ne.g. Minh's ORD`, {
    reply_markup: {
      force_reply: true,
    },
  });
  ctx.session.botOnFunction = 'add_event_receive_event_name';
};

/**
 * Creates an event for the specified team.
 * Used in _botOn_functions.ts in botOnFunction = 'add_event_receive_event_name'
 * @param ctx The callback query context.
 * @param notAllowedUser The user to exclude from the event.
 */
export const addEvent_ReceiveEventName = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.eventName = ctx.message.text;
  if (ctx.session.eventName == null) {
    addEvent_ReceiveEventName(ctx);
  }
  ctx.reply('Deadline of wish collection (dd/mm/yyyy): ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnFunction = 'add_event_receive_event_date';
};

/**
 * Creates an event for the specified team.
 * Used in _botOn_functions.ts in botOnFunction = 'add_event_receive_event_date'
 * @param ctx The callback query context.
 * @param notAllowedUser The user to exclude from the event.
 */
export const addEvent_ReceiveEventDate = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.eventDate = await ctx.message.text;
  if (ctx.session.eventDate == null) {
    addEvent_ReceiveEventDate(ctx);
  }
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name
      .map((n) => [
        {
          text: n.nameText,
          callback_data: `createEvent-${n.nameText}`,
        },
      ])
      .concat([
        [
          {
            text: 'Allow everyone to send wishes (No Exclusion)',
            callback_data: `createEvent-ALL`,
          },
        ],
      ])
  );
  await ctx.reply('Select the person to exclude in seeing this event', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Creates an event for the specified team.
 * @param ctx The callback query context.
 * @param notAllowedUser The user to exclude from the event.
 */
const addEvent_CreateEvent = async (
  ctx: CallbackQueryContext<BotContext>,
  notAllowedUser: string
) => {
  await removeInLineButton(ctx);

  const team = ctx.session.name;
  const eventName = ctx.session.eventName;
  const eventDate = ctx.session.eventDate;
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Welfare') {
    eventTeam = 'Welfare';
  } else {
    eventTeam = 'Bday';
  }
  if (team && eventName && eventDate) {
    const event = new Events();
    event.eventName = eventName;
    event.eventDate = eventDate;
    event.eventTeam = eventTeam;
    if (!notAllowedUser.includes('ALL')) {
      event.notAllowedUser = notAllowedUser;
    } else {
      event.notAllowedUser = '';
    }
    await Database.getMongoRepository(Events).save(event);
    await ctx.reply(`${eventName} (${team} Event) added!`);
  }
  ctx.session = initial();
};

/**
 * Deletes an event for the specified team.
 * @param bot The Bot instance.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const delEvent = async (bot: Bot<BotContext>, team: 'Welfare' | 'Birthday') => {
  let eventName: string;
  bot.callbackQuery(
    `del${team}Events`,
    async (ctx) => await delEvent_EventMenu(ctx, team)
  );
  bot.callbackQuery(/^delEventName/g, async (ctx) => {
    eventName = ctx.update.callback_query.data.substring(
      'delEventName-'.length
    );
    await delEvent_CfmMsg(ctx, eventName);
  });
  bot.callbackQuery(/^cfmDelEvent-/g, (ctx) =>
    delEvent_PerformDeletion(
      ctx,
      ctx.update.callback_query.data.substring('cfmDelEvent-'.length),
      eventName
    )
  );
};

/*
  The following functions are used to delete an event for the specified team.
  These functions are used in the delEvent function.
*/

/**
 * Displays the event menu for deletion.
 * @param ctx The callback query context.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const delEvent_EventMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Birthday') {
    eventTeam = 'Bday';
  } else {
    eventTeam = 'Welfare';
  }

  const event = await Database.getMongoRepository(Events).find({
    eventTeam: eventTeam,
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `delEventName-${n.eventName}`,
      },
    ])
  );
  await ctx.reply(`Choose ${team} Event to delete`, {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Displays a confirmation message for the deletion of an event.
 * @param ctx The callback query context.
 * @param eventName The name of the event to delete.
 * @returns The name of the event to delete.
 */
const delEvent_CfmMsg = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: `cfmDelEvent-Y`,
      },
    ],
    [
      {
        text: 'No',
        callback_data: `cfmDelEvent-N`,
      },
    ],
  ]);
  await ctx.reply(`Are you sure you want to delete ${eventName}`, {
    reply_markup: inlineKeyboard,
  });
  return eventName;
};

/**
 * Performs the deletion of an event.
 * @param ctx The callback query context.
 * @param choice The choice to delete the event.
 * @param eventName The name of the event to delete.
 */
const delEvent_PerformDeletion = async (
  ctx: CallbackQueryContext<BotContext>,
  choice: string,
  eventName: string
) => {
  await removeInLineButton(ctx);

  if (eventName) {
    if (choice == 'Y') {
      const event = new Events();
      event.eventName = eventName;
      const wishEvent = new Wishes();
      wishEvent.eventName = eventName;
      await Database.getMongoRepository(Events).delete(event);
      await Database.getMongoRepository(Wishes).delete(wishEvent);
      await ctx.reply(`${eventName} deleted!`);
    } else if (choice == 'N') {
      await ctx.reply(`Deletion cancelled`);
    } else {
      await ctx.reply(`Error in deletion! Please try again`);
    }
  } else {
    await ctx.reply(`Error in deletion! Please try again`);
    console.log('Session data not found! (eventName)');
  }
  ctx.session = initial();
};

/**
 * Edits an event for the specified team.
 * @param bot The Bot instance.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const editEvent = async (
  bot: Bot<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  let eventName: string;
  bot.callbackQuery(`edit${team}Events`, (ctx) => editEvent_Init(ctx, team));
  bot.callbackQuery(/^editEventMenu-/g, (ctx) => {
    eventName = ctx.update.callback_query.data.substring(
      'editEventMenu-'.length
    );
    editEvent_EditMenu(ctx, eventName, team);
  });
  bot.callbackQuery('editEventName', (ctx) => editEventName(ctx, eventName));
  bot.callbackQuery('editEventDate', (ctx) => editEventDate(ctx));
  bot.callbackQuery('editNotAllowedUser', (ctx) =>
    editNotAllowedUser(ctx, eventName)
  );
  bot.callbackQuery(/^editNotAllowedUserSelect-/g, (ctx) =>
    editNotAllowedUser_Execution(ctx, eventName)
  );
};

/*
  The following functions are used to edit an event for the specified team.
  These functions are used in the editEvent function.
*/

/**
 * Initializes the event editing process.
 * @param ctx The callback query context.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const editEvent_Init = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Birthday') {
    eventTeam = 'Bday';
  } else {
    eventTeam = 'Welfare';
  }
  const event = await Database.getMongoRepository(Events).find({
    eventTeam: eventTeam,
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((w) => [
      {
        text: w.eventName,
        callback_data: `editEventMenu-${w.eventName}`,
      },
    ])
  );
  await ctx.reply(`Choose ${team} Event to edit`, {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Edits the menu for an event.
 * @param ctx The callback query context.
 * @param eventName The name of the event to edit.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const editEvent_EditMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string,
  team: 'Welfare' | 'Birthday'
) => {
  await removeInLineButton(ctx);
  const getEvents = await Database.getMongoRepository(Events).find({
    eventName: eventName,
  });
  ctx.session.id = getEvents.map((n) => n.id)[0];

  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Event Name',
        callback_data: 'editEventName',
      },
    ],
    [
      {
        text: 'Event Date',
        callback_data: 'editEventDate',
      },
    ],
    [
      {
        text: 'Excluded User',
        callback_data: 'editNotAllowedUser',
      },
    ],
    [
      {
        text: 'Back',
        callback_data: `manage${team}Event`,
      },
    ],
  ]);
  await ctx.reply('Choose option to edit', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Edits the name of an event.
 * @param ctx The callback query context.
 * @param eventName The name of the event to edit.
 */
const editEventName = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await removeInLineButton(ctx);
  await ctx.reply(
    `The current event name is <b>${eventName}</b>\n What would like to change it to?`,
    {
      parse_mode: 'HTML',
      reply_markup: { force_reply: true },
    }
  );
  ctx.session.botOnFunction = 'edit_event_name';
};

/**
 * Edits the name of an event.
 * Used in _botOn_functions.ts in botOnFunction = 'edit_event_name'
 * @param ctx The callback query context.
 * @param eventName The name of the event to edit.
 */
export const editEventName_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const newEventName = await ctx.message.text;
  if (newEventName == null) {
    editEventName_Execution(ctx);
  }

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventName: newEventName } }
  );

  await ctx.reply(`Event Name changed to ${newEventName}`);
  ctx.session = initial();
};

/**
 * Edits the date of an event.
 * @param ctx The callback query context.
 */
const editEventDate = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  await ctx.reply('Change event date to: (dd/mm/yyyy) :', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnFunction = 'edit_event_date';
};
//Used in _botOn_functions.ts in botOnFunction = 'edit_event_date'
export const editEventDate_Execution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const newEventDate = await ctx.message.text;
  if (newEventDate == null) {
    editEventDate_Execution(ctx);
  }

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventDate: newEventDate } }
  );

  await ctx.reply(`Event Date changed to ${newEventDate}`);
  ctx.session = initial();
};

/**
 * Edits the user excluded from an event.
 * @param ctx The callback query context.
 * @param eventName The name of the event to edit.
 */
const editNotAllowedUser = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await removeInLineButton(ctx);
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name
      .map((n) => [
        {
          text: n.nameText,
          callback_data: `editNotAllowedUserSelect-${n.nameText}`,
        },
      ])
      .concat([
        [
          {
            text: 'Allow everyone to send wishes (No Exclusion)',
            callback_data: `editNotAllowedUserSelect-ALL`,
          },
        ],
      ])
  );
  await ctx.reply(`Choose new user to exclude from ${eventName}`, {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Executes the exclusion of a user from an event.
 * @param ctx The callback query context.
 * @param eventName The name of the event to edit.
 */
const editNotAllowedUser_Execution = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await removeInLineButton(ctx);
  let selectedName = ctx.update.callback_query.data.substring(
    'editNotAllowedUserSelect-'.length
  );
  if (selectedName == 'ALL') {
    selectedName = '';
  }
  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { notAllowedUser: selectedName } }
  );
  if (selectedName == '') {
    await ctx.reply(`Everyone is allowed to see ${eventName}`);
  } else {
    await ctx.reply(`User ${selectedName} is excluded from ${eventName}`);
  }
  ctx.session = initial();
};
