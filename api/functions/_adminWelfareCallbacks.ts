import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Events, Names, Wishes } from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';

// See Wish Callbacks
export const seeWish_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const welfareEvent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const wishNumber = await Database.getMongoRepository(Wishes);
  const totalNames = await Database.getMongoRepository(Names).count();
  const inlineKeyboard = new InlineKeyboard(
    await Promise.all(
      welfareEvent.map(async (event) => [
        {
          text: `${event.eventName}  ( ${
            (await wishNumber.find({ eventName: event.eventName })).length
          } / ${totalNames} )`,
          callback_data: `welfareWish_1-${event.eventName}`,
        },
      ])
    )
  );

  await ctx.reply('Select Welfare Event', {
    reply_markup: inlineKeyboard,
  });
};

export const seeWish_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = ctx.update.callback_query.data.substring(
    'welfareWish_1-'.length
  );
  const welfareWishArray = await Database.getMongoRepository(Wishes).find({
    eventName: callback,
  });
  await Promise.all(
    welfareWishArray.map(async (n) => {
      await ctx.reply(`@${n.teleUser}\nWish: \n${n.wishText}`);
    })
  );
  if (welfareWishArray[0] == null) {
    await ctx.reply('No Wish Received 😢');
  }
};

// Reminder Management
export const reminderManagement = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Send to members that have not turned in',
        callback_data: 'sendNotInReminder',
      },
    ],
    [
      {
        text: 'Send to specific member',
        callback_data: 'sendSpecificReminder',
      },
    ],
  ]);

  await ctx.reply(
    `
	  Choose option
	  \n(Send all option will exclude the person its for)

		\nDO NOT ABUSE THE REMINDER SYSTEM.
	  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const sendNotInReminder_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const event = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `reminderNotInEvents-${n.eventName}`,
      },
    ])
  );
  await ctx.reply('Choose event:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendNotInReminder_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = ctx.update.callback_query.data.substring(
    'reminderNotInEvents-'.length
  );
  ctx.session.botOnType = 3;
  await ctx.reply(
    `Write down the reminder msg for people that have not sent it in
    \nSuggestion to put /sendwish so that user can click on it
    `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};
//Uses botOnType = 3 to work
export const sendNotInReminder_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const reminder = (await ctx.message.text) || '';
  const inWishes = await Database.getMongoRepository(Wishes).find({
    where: {
      eventName: { $eq: ctx.session.eventName },
    },
  });
  const notInNames = await Database.getMongoRepository(Names).find({
    where: {
      teleUser: { $not: { $in: inWishes.map((n) => `${n.teleUser}`) } },
    },
  });
  const notInUsers = notInNames
    .map((n) => `${n.teleUser}`)
    .filter((n) => n != '');
  await Promise.all(
    notInUsers.map(async (n) => {
      await sendMessageUser(n, reminder, ctx);
    })
  );

  await ctx.reply(`Reminder sent!`);

  ctx.session = await initial();
};

//Send Specific Person Reminder Msg
export const sendSpecificReminder_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const event = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `reminderSpecificEvents-${n.eventName}`,
      },
    ])
  );
  await ctx.reply('Choose event:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendSpecificReminder_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  ctx.session.eventName = ctx.update.callback_query.data.substring(
    'reminderSpecificEvents-'.length
  );
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `reminderSpecificNames-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply('Choose member:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendSpecificReminder_3 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const telegramUser = await ctx.update.callback_query.data.substring(
    'reminderSpecificNames-'.length
  );
  ctx.session.reminderUser = telegramUser;
  ctx.session.botOnType = 2;
  await ctx.reply(
    `Write down the reminder msg that you want to send to @${telegramUser}
    \nSuggestion to put /sendwish so that user can click on it
    `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};

//Uses botOnType = 2 to work
export const sendSpecificReminder_4 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  if (ctx.session.reminderUser) {
    const reminder = (await ctx.message.text) || '';
    await sendMessageUser(ctx.session.reminderUser, reminder, ctx);
    await ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
  }
  ctx.session = await initial();
};

//Manage Welfare Events
export const manageWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'See all Welfare Events',
        callback_data: 'seeWelfareEvents',
      },
    ],
    [
      {
        text: 'Add Welfare Event',
        callback_data: 'addWelfareEvent',
      },
    ],
    [
      {
        text: 'Delete Welfare Event',
        callback_data: 'deleteWelfareEvent',
      },
    ],
    [
      {
        text: 'Edit Welfare Event',
        callback_data: 'editWelfareEvent',
      },
    ],
  ]);

  await ctx.reply(
    `
		  Choose option
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
//See Welfare Events
export const seeWelfareEvents = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const allWelfareEvents = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const eventListed = await allWelfareEvents.map(
    (n) =>
      `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`
  );

  await ctx.reply(eventListed.join('\n\n'));
};
//Add Welfare Event Callback
export const addWelfareEvent_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.reply('Input Welfare event Name', {
    reply_markup: {
      force_reply: true,
    },
  });
  ctx.session.botOnType = 4;
};
export const addWelfareEvent_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session = await initial();
  ctx.session.eventName = (await ctx.message.text) || '';
  ctx.reply('Deadline of the event put in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 5;
};
export const addWelfareEvent_3 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = await undefined;
  ctx.session.eventDate = (await ctx.message.text) || '';
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name
      .map((n) => [
        {
          text: n.nameText,
          callback_data: `nameAddWelfareEvent-${n.nameText}`,
        },
      ])
      .concat([
        [
          {
            text: 'All can see',
            callback_data: 'nameAddWelfareEvent-ALL',
          },
        ],
      ])
  );
  await ctx.reply('Select person to not be able to see this event', {
    reply_markup: inlineKeyboard,
  });
};
export const addWelfareEvent_4 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = ctx.update.callback_query.data.substring(
    'nameAddWelfareEvent-'.length
  );

  const event = new Events();
  event.eventName = ctx.session.eventName || '';
  event.eventDate = ctx.session.eventDate || '';
  event.eventTeam = 'Welfare';
  if (name != 'ALL') {
    event.notAllowedUser = name;
  }
  await Database.getMongoRepository(Events).save(event);
  await ctx.reply(`${ctx.session.eventName} (Welfare Event) added!`);
  ctx.session = initial();
};

//Delete Welfare Event
export const deleteWelfareEvent_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const delevent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const inlineKeyboard = new InlineKeyboard(
    delevent.map((n) => [
      {
        text: n.eventName,
        callback_data: `delWelfareEvent-${n.eventName}`,
      },
    ])
  );
  await ctx.reply('Select event to delete', {
    reply_markup: inlineKeyboard,
  });
};
export const deleteWelfareEvent_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  ctx.session.eventName = ctx.update.callback_query.data.substring(
    'delWelfareEvent-'.length
  );
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'yesWelfareDelEvent',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noWelfareDelEvent',
      },
    ],
  ]);
  await ctx.reply(`Are you sure you want to delete ${ctx.session.eventName}`, {
    reply_markup: inlineKeyboard,
  });
};
export const deleteWelfareEvent_Yes = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const event = new Events();
  event.eventName = ctx.session.eventName || '';
  const wishEvent = new Wishes();
  wishEvent.eventName = ctx.session.eventName || '';
  await Database.getMongoRepository(Events).delete(event);
  await Database.getMongoRepository(Wishes).delete(wishEvent);
  await ctx.reply(`${ctx.session.eventName} deleted!`);
  ctx.session = await initial();
};
export const deleteWelfareEvent_No = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply(`Deletion cancelled`);
  ctx.session = await initial();
};
export const editWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const welfareEvent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Welfare',
  });
  const inlineKeyboard = new InlineKeyboard(
    welfareEvent.map((w) => [
      {
        text: w.eventName,
        callback_data: `editWelfareEvent-${w.eventName}`,
      },
    ])
  );
  await ctx.reply('Choose Welfare Event to edit', {
    reply_markup: inlineKeyboard,
  });
};

export const editWelfareEventMenu = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = ctx.update.callback_query.data.substring(
    'editWelfareEvent-'.length
  );
  const getEvents = await Database.getMongoRepository(Events).find({
    eventName: name,
  });
  ctx.session.id = getEvents.map((n) => n.id)[0];

  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Event Name',
        callback_data: 'editWelfareEventName',
      },
    ],
    [
      {
        text: 'Event Date',
        callback_data: 'editWelfareEventDate',
      },
    ],
    [
      {
        text: 'User that is not allowed to see',
        callback_data: 'editWelfareNotAllowedUser',
      },
    ],
    [
      {
        text: 'Back',
        callback_data: 'manageWelfareEvent',
      },
    ],
  ]);
  await ctx.reply('Choose option to edit', {
    reply_markup: inlineKeyboard,
  });
};

export const editWelfareEventName_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('New event name :', { reply_markup: { force_reply: true } });
  ctx.session.botOnType = 6;
};
//Uses botOntype = 6;
export const editWelfareEventName_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const newEventName = (await ctx.message.text) || '';

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventName: newEventName } }
  );

  await ctx.reply(`Event Name changed to ${newEventName}`);
  ctx.session = await initial();
};

export const editWelfareEventDate_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('New event date in (dd/mm/yyyy) :', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 7;
};
//Uses botOntype = 7;
export const editWelfareEventDate_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  const newEventDate = (await ctx.message.text) || '';

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventDate: newEventDate } }
  );

  await ctx.reply(`Event Date changed to ${newEventDate}`);
  ctx.session = await initial();
};

export const editWelfareNotAllowedUser_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `editNotAllowedUser-${n.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user', { reply_markup: inlineKeyboard });
};
export const editWelfareNotAllowedUser_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'editNotAllowedUser-'.length
  );
  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { notAllowedUser: selectedName } }
  );
  await ctx.reply(`Not allowed user changed to ${selectedName}`);
  ctx.session = await initial();
};

//Welfare Team Memembers Management
export const manageWelfareTeam = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add Member',
        callback_data: 'addWelfareMember',
      },
    ],
    [
      {
        text: 'Delete Member',
        callback_data: 'delWelfareMember',
      },
    ],
    [
      {
        text: 'Edit Member',
        callback_data: 'editWelfareMember',
      },
    ],
  ]);
  const userList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['welfare'] },
    },
  });
  const icList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['welfareIC'] },
    },
  });
  await ctx.reply(
    `Welfare Team\n\nIC:\n${icList
      .map((n) => n.nameText)
      .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const addWelfareMember_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $not: { $in: ['welfare', 'welfareIC'] } },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `addWelfareMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to add into team', {
    reply_markup: inlineKeyboard,
  });
};

export const addWelfareMember_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'addWelfareMember-'.length
  );
  const userRoleList = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  )
    .flatMap((n) => n.role)
    .flat()
    .concat(['welfare']);
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: userRoleList } }
  );
  await ctx.reply(`${selectedName} added into Welfare Team`);
};

export const delWelfareMember_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['welfare', 'welfareIC'] },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `delWelfareMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to remove from team', {
    reply_markup: inlineKeyboard,
  });
};

export const delWelfareMember_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'delWelfareMember-'.length
  );
  let userRoleList = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  ).flatMap((n) => n.role);
  if (userRoleList.includes('welfare')) {
    await userRoleList.splice(userRoleList.indexOf('welfare', 1));
  } else if (userRoleList.includes('welfareIC')) {
    await userRoleList.splice(userRoleList.indexOf('welfareIC', 1));
  }
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: userRoleList } }
  );
  await ctx.reply(`${selectedName} removed from Welfare Team`);
};

export const editWelfareMember_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['welfare', 'welfareIC'] },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `editWelfareMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to IC/member from team', {
    reply_markup: inlineKeyboard,
  });
};

export const editWelfareMember_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'editWelfareMember-'.length
  );
  let editRole = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  ).flatMap((n) => n.role);
  let changeRole = '';
  if (editRole.includes('welfare')) {
    await editRole.splice(editRole.indexOf('welfare', 1));
    changeRole = 'Welfare IC';
    await editRole.push('welfareIC');
  } else if (editRole.includes('welfareIC')) {
    await editRole.splice(editRole.indexOf('welfareIC', 1));
    changeRole = 'Welfare Member';
    await editRole.push('welfare');
  }
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: editRole } }
  );
  await ctx.reply(`${selectedName} changed to ${changeRole}`);
};
