import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Events, Names, Wishes } from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';
import { IsNull } from 'typeorm';
import { eventNames } from 'process';

// See Wish Callbacks
export const seeWish_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const welfareEvent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Bday',
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
          callback_data: `bdayWish_1-${event.eventName}`,
        },
      ])
    )
  );
  await ctx.reply('Select Birthday Event', {
    reply_markup: inlineKeyboard,
  });
};

export const seeWish_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = ctx.update.callback_query.data.substring(
    'bdayWish_1-'.length
  );
  const WishArray = await Database.getMongoRepository(Wishes).find({
    eventName: callback,
  });

  await Promise.all(
    WishArray.map(async (n) => {
      await ctx.reply(`@${n.teleUser}\nWish: \n${n.wishText}`);
    })
  );
  if (WishArray[0] == null) {
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
        callback_data: 'sendBdayNotInReminder',
      },
    ],
    [
      {
        text: 'Send to specific member',
        callback_data: 'sendBdaySpecificReminder',
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
    eventTeam: 'Bday',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `reminderBdayNotInEvents-${n.eventName}`,
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
  ctx.session.eventName = await ctx.update.callback_query.data.substring(
    'reminderBdayNotInEvents-'.length
  );
  ctx.session.botOnType = 10;
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
//Uses botOnType = 10 to work
export const sendNotInReminder_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const reminder = (await ctx.message.text) || '';
  const wishEventName = (await ctx.session.eventName) || '';
  const inWishes = await Database.getMongoRepository(Wishes).find({
    eventName: wishEventName,
  });
  const notAllowedName = await Database.getMongoRepository(Events).find({
    eventName: wishEventName,
  });

  const notAllowedUser = await Database.getMongoRepository(Names).find({
    nameText: notAllowedName.map((n) => n.notAllowedUser),
  });

  const notInNames = await Database.getMongoRepository(Names).find({
    where: {
      teleUser: {
        $not: {
          $in: await inWishes.map((n) => n.teleUser),
        },
      },
    },
  });
  const notInUsers = await notInNames
    .map((n) => n.teleUser)
    .filter((n) => n != '')
    .filter((n) => n != notAllowedUser[0].teleUser);

  await ctx.reply(notInUsers.toString());

  await Promise.all(
    notInUsers.map(async (n) => {
      // await sendMessageUser(n, reminder, ctx);
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
    eventTeam: 'Bday',
  });
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `reminderBdaySpecificEvents-${n.eventName}`,
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
    'reminderBdaySpecificEvents-'.length
  );
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `reminderBdaySpecificNames-${n.teleUser}`,
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
    'reminderBdaySpecificNames-'.length
  );
  ctx.session.reminderUser = telegramUser;
  ctx.session.botOnType = 11;
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

//Uses botOnType = 11 to work
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

//Manage Birthday Events
export const manageEvent = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'See all Birthday Events',
        callback_data: 'seeBdayEvents',
      },
    ],
    [
      {
        text: 'Add Birthday Event',
        callback_data: 'addBdayEvent',
      },
    ],
    [
      {
        text: 'Delete Birthday Event',
        callback_data: 'deleteBdayEvent',
      },
    ],
    [
      {
        text: 'Edit Birthday Event',
        callback_data: 'editBdayEvent',
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
export const seeEvents = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const allWelfareEvents = await Database.getMongoRepository(Events).find({
    eventTeam: 'Bday',
  });
  const eventListed = await allWelfareEvents.map(
    (n) =>
      `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`
  );

  await ctx.reply(eventListed.join('\n\n'));
};
//Add Welfare Event Callback
export const addBdayEvent_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.reply('Input Birthday event Name', {
    reply_markup: {
      force_reply: true,
    },
  });
  ctx.session.botOnType = 12;
};
//botOntype = 12
export const addBdayEvent_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session = await initial();
  ctx.session.eventName = (await ctx.message.text) || '';
  ctx.reply('Deadline of the event put in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 13;
};
//botOntype = 13
export const addBdayEvent_3 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = await undefined;
  ctx.session.eventDate = (await ctx.message.text) || '';
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name
      .map((n) => [
        {
          text: n.nameText,
          callback_data: `nameAddBdayEvent-${n.nameText}`,
        },
      ])
      .concat([
        [
          {
            text: 'All can see',
            callback_data: 'nameAddBdayEvent-ALL',
          },
        ],
      ])
  );
  await ctx.reply('Select person to not be able to see this event', {
    reply_markup: inlineKeyboard,
  });
};
export const addBdayEvent_4 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = ctx.update.callback_query.data.substring(
    'nameAddBdayEvent-'.length
  );

  const event = new Events();
  event.eventName = ctx.session.eventName || '';
  event.eventDate = ctx.session.eventDate || '';
  event.eventTeam = 'Bday';
  if (name != 'ALL') {
    event.notAllowedUser = name;
  }
  await Database.getMongoRepository(Events).save(event);
  await ctx.reply(`${ctx.session.eventName} (Birthday Event) added!`);
  ctx.session = initial();
};

//Delete Welfare Event
export const deleteEvent_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const delevent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Bday',
  });
  const inlineKeyboard = new InlineKeyboard(
    delevent.map((n) => [
      {
        text: n.eventName,
        callback_data: `delBdayEvent-${n.eventName}`,
      },
    ])
  );
  await ctx.reply('Select event to delete', {
    reply_markup: inlineKeyboard,
  });
};
export const deleteEvent_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  ctx.session.eventName = ctx.update.callback_query.data.substring(
    'delBdayEvent-'.length
  );
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'yesBdayDelEvent',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noBdayDelEvent',
      },
    ],
  ]);
  await ctx.reply(`Are you sure you want to delete ${ctx.session.eventName}`, {
    reply_markup: inlineKeyboard,
  });
};
export const deleteEvent_Yes = async (
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
export const deleteEvent_No = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply(`Deletion cancelled`);
  ctx.session = await initial();
};

export const editEvent = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const bdayEvent = await Database.getMongoRepository(Events).find({
    eventTeam: 'Bday',
  });
  const inlineKeyboard = new InlineKeyboard(
    bdayEvent.map((w) => [
      {
        text: w.eventName,
        callback_data: `editBdayEvent-${w.eventName}`,
      },
    ])
  );
  await ctx.reply('Choose Birthday Event to edit', {
    reply_markup: inlineKeyboard,
  });
};

export const editEventMenu = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = ctx.update.callback_query.data.substring(
    'editBdayEvent-'.length
  );
  const getEvents = await Database.getMongoRepository(Events).find({
    eventName: name,
  });
  ctx.session.id = getEvents.map((n) => n.id)[0];
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Event Name',
        callback_data: 'editBdayEventName',
      },
    ],
    [
      {
        text: 'Event Date',
        callback_data: 'editBdayEventDate',
      },
    ],
    [
      {
        text: 'User that is not allowed to see',
        callback_data: 'editBdayNotAllowedUser',
      },
    ],
    [
      {
        text: 'Back',
        callback_data: 'manageBdayEvent',
      },
    ],
  ]);
  await ctx.reply('Choose option to edit', {
    reply_markup: inlineKeyboard,
  });
};

export const editEventName_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('New event name :', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 14;
};
//Uses botOntype = 14;
export const editEventName_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = await undefined;
  const newEventName = (await ctx.message.text) || '';

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventName: newEventName } }
  );

  await ctx.reply(`Event Name changed to ${newEventName}`);
  ctx.session = await initial();
};

export const editEventDate_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('New event date in (dd/mm/yyyy) :', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 15;
};
//Uses botOntype = 15;
export const editEventDate_2 = async (ctx: Filter<BotContext, 'message'>) => {
  ctx.session.botOnType = await undefined;
  const newEventDate = (await ctx.message.text) || '';

  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { eventDate: newEventDate } }
  );

  await ctx.reply(`Event Date changed to ${newEventDate}`);
  ctx.session = await initial();
};

export const editNotAllowedUser_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `editBdayNotAllowedUser-${n.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user', { reply_markup: inlineKeyboard });
};
export const editNotAllowedUser_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'editBdayNotAllowedUser-'.length
  );
  await Database.getMongoRepository(Events).updateOne(
    { _id: ctx.session.id },
    { $set: { notAllowedUser: selectedName } }
  );
  await ctx.reply(`Not allowed user changed to ${selectedName}`);
  ctx.session = await initial();
};

//Bday Team Memembers Management
export const manageTeam = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add Member',
        callback_data: 'addWBdayMember',
      },
    ],
    [
      {
        text: 'Delete Member',
        callback_data: 'delBdayMember',
      },
    ],
    [
      {
        text: 'Edit Member',
        callback_data: 'editBdayMember',
      },
    ],
  ]);
  const userList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['bday'] },
    },
  });
  const icList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['bdayIC'] },
    },
  });
  await ctx.reply(
    `Birthday Team\n\nIC:\n${icList
      .map((n) => n.nameText)
      .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const addMember_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $not: { $in: ['bday', 'bdayIC'] } },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `addBdayMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to add into team', {
    reply_markup: inlineKeyboard,
  });
};

export const addMember_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'addBdayMember-'.length
  );
  const userRoleList = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  )
    .flatMap((n) => n.role)
    .flat()
    .concat(['bday']);
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: userRoleList } }
  );
  await ctx.reply(`${selectedName} added into Birthday Team`);
};

export const delMember_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['bday', 'bdayIC'] },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `delBdayMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to remove from team', {
    reply_markup: inlineKeyboard,
  });
};

export const delMember_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'delBdayMember-'.length
  );
  let userRoleList = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  ).flatMap((n) => n.role);
  if (userRoleList.includes('bday')) {
    await userRoleList.splice(userRoleList.indexOf('bday', 1));
  } else if (userRoleList.includes('bdayIC')) {
    await userRoleList.splice(userRoleList.indexOf('bdayIC', 1));
  }
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: userRoleList } }
  );
  await ctx.reply(`${selectedName} removed from Welfare Team`);
};

export const editMember_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const namelist = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: ['bday', 'bdayIC'] },
    },
  });
  const inlineKeyboard = new InlineKeyboard(
    namelist.map((w) => [
      {
        text: w.nameText,
        callback_data: `editBdayMember-${w.nameText}`,
      },
    ])
  );
  await ctx.reply('Choose user to IC/member from team', {
    reply_markup: inlineKeyboard,
  });
};

export const editMember_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const selectedName = await ctx.update.callback_query.data.substring(
    'editBdayMember-'.length
  );
  let editRole = await (
    await Database.getMongoRepository(Names).find({ nameText: selectedName })
  ).flatMap((n) => n.role);
  let changeRole = '';
  if (editRole.includes('bday')) {
    await editRole.splice(editRole.indexOf('bday', 1));
    changeRole = 'Birthday IC';
    await editRole.push('bdayIC');
  } else if (editRole.includes('bdayIC')) {
    await editRole.splice(editRole.indexOf('bdayIC', 1));
    changeRole = 'Birthday Member';
    await editRole.push('bday');
  }
  await Database.getMongoRepository(Names).updateOne(
    { nameText: selectedName },
    { $set: { role: editRole } }
  );
  await ctx.reply(`${selectedName} changed to ${changeRole}`);
};
