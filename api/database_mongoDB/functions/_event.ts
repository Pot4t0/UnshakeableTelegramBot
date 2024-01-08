import {
  Bot,
  CallbackQueryContext,
  Context,
  Filter,
  InlineKeyboard,
} from 'grammy';
import { BotContext } from '../../app/_context';
import { Database } from '../_db-init';
import { Events, Names, Wishes } from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';

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
  bot.callbackQuery(`manage${team}Event`, (ctx) => eventManageMenu(ctx, team));
  bot.callbackQuery(`see${team}Events`, (ctx) => eventView(ctx, team));
  addEvent(bot, team);
  delEvent(bot, team);
  editEvent(bot, team);
};
const eventManageMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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

const eventView = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  let eventTeam: 'Welfare' | 'Bday';
  if (team == 'Welfare') {
    eventTeam = 'Welfare';
  } else {
    eventTeam = 'Bday';
  }
  const allEvents = await Database.getMongoRepository(Events).find({
    eventTeam: eventTeam,
  });
  const eventListed = await allEvents.map(
    (n) =>
      `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`
  );

  await ctx.reply(eventListed.join('\n\n'));
};
const addEvent = async (bot: Bot<BotContext>, team: 'Welfare' | 'Birthday') => {
  bot.callbackQuery(`add${team}Events`, (ctx) => addEvent_Init(ctx, team));
  bot.callbackQuery(/^createEvent-/g, (ctx) =>
    addEvent_CreateEvent(
      ctx,
      ctx.update.callback_query.data.substring(`createEvent-`.length)
    )
  );
};

const addEvent_Init = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  ctx.session.name = team;
  ctx.reply(`Input ${team} event Name\ne.g. Minh's ORD`, {
    reply_markup: {
      force_reply: true,
    },
  });
  ctx.session.botOnType = 4;
};

//Used in _botOn_functions.ts in botOntype = 4
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
  ctx.session.botOnType = 5;
};

//Used in _botOn_functions.ts in botOntype = 5
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

const addEvent_CreateEvent = async (
  ctx: CallbackQueryContext<BotContext>,
  notAllowedUser: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

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
    if (notAllowedUser != 'ALL') {
      event.notAllowedUser = notAllowedUser;
    }
    await Database.getMongoRepository(Events).save(event);
    await ctx.reply(`${eventName} (${team} Event) added!`);
  }
  ctx.session = initial();
};

const delEvent = async (bot: Bot<BotContext>, team: 'Welfare' | 'Birthday') => {
  let eventName: string;
  bot.callbackQuery(`del${team}Events`, (ctx) => delEvent_EventMenu(ctx, team));
  bot.callbackQuery(/^delEventName/g, (ctx) => {
    eventName = ctx.update.callback_query.data.substring(
      'delEventName-'.length
    );
    delEvent_CfmMsg(ctx, eventName);
  });
  bot.callbackQuery(/^cfmDelEvent-/g, (ctx) =>
    delEvent_PerformDeletion(
      ctx,
      ctx.update.callback_query.data.substring('cfmDelEvent-'.length),
      eventName
    )
  );
};

const delEvent_EventMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

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

const delEvent_CfmMsg = async (
  ctx: CallbackQueryContext<Context>,
  eventName: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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

const delEvent_PerformDeletion = async (
  ctx: CallbackQueryContext<BotContext>,
  choice: string,
  eventName: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

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
  ctx.session = await initial();
};

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
const editEvent_Init = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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

const editEvent_EditMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string,
  team: 'Welfare' | 'Birthday'
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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

const editEventName = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply(
    `The current event name is <b>${eventName}</b>\n What would like to change it to?`,
    {
      parse_mode: 'HTML',
      reply_markup: { force_reply: true },
    }
  );
  ctx.session.botOnType = 6;
};

//Used in _botOn_functions.ts in botOntype = 6
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

const editEventDate = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Change event date to: (dd/mm/yyyy) :', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 7;
};
//Used in _botOn_functions.ts in botOntype = 7
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
  ctx.session = await initial();
};

const editNotAllowedUser = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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

const editNotAllowedUser_Execution = async (
  ctx: CallbackQueryContext<BotContext>,
  eventName: string
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  let selectedName = await ctx.update.callback_query.data.substring(
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
  ctx.session = await initial();
};
