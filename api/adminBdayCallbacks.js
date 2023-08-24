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
exports.deleteWelfareEvent_No = exports.deleteWelfareEvent_Yes = exports.deleteWelfareEvent_2 = exports.deleteEvent_1 = exports.addBdayEvent_4 = exports.addBdayEvent_3 = exports.addBdayEvent_2 = exports.addBdayEvent_1 = exports.seeEvents = exports.manageEvent = exports.sendSpecificReminder_4 = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = exports.seeWish_2 = exports.seeWish_1 = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const db_functions_1 = require("./db_functions");
const SessionData_1 = require("../models/SessionData");
// See Wish Callbacks
const seeWish_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const welfareEvent = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(welfareEvent.map((w) => [
        {
            text: w.eventName,
            callback_data: `bdayWish_1-${w.eventName}`,
        },
    ]));
    yield ctx.reply('Select Birthday Event', {
        reply_markup: inlineKeyboard,
    });
});
exports.seeWish_1 = seeWish_1;
const seeWish_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = ctx.update.callback_query.data.substring('bdayWish_1-'.length);
    const WishArray = yield db_init_1.Database.getMongoRepository(tableEntity_1.Wishes).find({
        eventName: callback,
    });
    const wishTable = yield WishArray.map((n) => `@${n.teleUser}\nWish: \n${n.wishText}`);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [{ text: 'Back', callback_data: 'seeBdayWishes' }],
    ]);
    yield ctx.reply(wishTable.join('\n\n'), {
        reply_markup: inlineKeyboard,
    });
});
exports.seeWish_2 = seeWish_2;
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
	  Choose option
	  (Send all option will exlude the person its for)

	  DO NOT ABUSE THE REMINDER SYSTEM.
	  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.reminderManagement = reminderManagement;
const sendNotInReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `reminderBdayNotInEvents-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Choose event:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendNotInReminder_1 = sendNotInReminder_1;
const sendNotInReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = ctx.update.callback_query.data.substring('reminderNotInEvents-'.length);
    ctx.session.botOnType = 10;
    yield ctx.reply(`Write down the reminder msg for people that have not sent it in
    \nSuggestion to be /sendwish so that user can click on it
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendNotInReminder_2 = sendNotInReminder_2;
//Uses botOnType = 10 to work
const sendNotInReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const reminder = (yield ctx.message.text) || '';
    const inWishes = yield db_init_1.Database.getMongoRepository(tableEntity_1.Wishes).find({
        where: {
            eventName: { $eq: ctx.session.eventName },
        },
    });
    const notInNames = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
        where: {
            teleUser: { $not: { $in: inWishes.map((n) => `${n.teleUser}`) } },
        },
    });
    const notInUsers = notInNames
        .map((n) => `${n.teleUser}`)
        .filter((n) => n != '');
    for (let i = 0; i < notInUsers.length; i++) {
        yield (0, db_functions_1.sendMessageUser)(notInUsers[i], reminder, ctx);
    }
    yield ctx.reply(`Reminder sent!`);
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.sendNotInReminder_3 = sendNotInReminder_3;
//Send Specific Person Reminder Msg
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `reminderBdaySpecificEvents-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Choose event:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_1 = sendSpecificReminder_1;
const sendSpecificReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = ctx.update.callback_query.data.substring('reminderBdaySpecificEvents-'.length);
    const name = yield db_init_1.Database.getRepository(tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `reminderBdaySpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_2 = sendSpecificReminder_2;
const sendSpecificReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderBdaySpecificNames-'.length);
    ctx.session.reminderUser = telegramUser;
    ctx.session.botOnType = 11;
    yield ctx.reply(`Write down the reminder msg that you want to send to @${telegramUser} 
    \nSuggestion to be /sendwish so that user can click on it
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
//Uses botOnType = 11 to work
const sendSpecificReminder_4 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.reminderUser) {
        const reminder = (yield ctx.message.text) || '';
        yield (0, db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.sendSpecificReminder_4 = sendSpecificReminder_4;
//Manage Birthday Events
const manageEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
		  Choose option
		  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.manageEvent = manageEvent;
//See Welfare Events
const seeEvents = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const allWelfareEvents = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const eventListed = yield allWelfareEvents.map((n) => `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`);
    yield ctx.reply(eventListed.join('\n\n'));
});
exports.seeEvents = seeEvents;
//Add Welfare Event Callback
const addBdayEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.reply('Input Birthday event Name', {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 12;
});
exports.addBdayEvent_1 = addBdayEvent_1;
//botOntype = 12
const addBdayEvent_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session = yield (0, SessionData_1.initial)();
    ctx.session.eventName = (yield ctx.message.text) || '';
    ctx.reply('Deadline of the event put in dd/mm/yyyy: ');
    ctx.session.botOnType = 13;
});
exports.addBdayEvent_2 = addBdayEvent_2;
//botOntype = 13
const addBdayEvent_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    ctx.session.eventDate = (yield ctx.message.text) || '';
    const name = yield db_init_1.Database.getRepository(tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name
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
    ]));
    yield ctx.reply('Select person to not be able to see this event', {
        reply_markup: inlineKeyboard,
    });
});
exports.addBdayEvent_3 = addBdayEvent_3;
const addBdayEvent_4 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = ctx.update.callback_query.data.substring('nameAddBdayEvent-'.length);
    const event = new tableEntity_1.Events();
    event.eventName = ctx.session.eventName || '';
    event.eventDate = ctx.session.eventDate || '';
    event.eventTeam = 'Bday';
    if (name != 'ALL') {
        event.notAllowedUser = name;
    }
    yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).save(event);
    yield ctx.reply(`${ctx.session.eventName} (Birthday Event) added!`);
    ctx.session = (0, SessionData_1.initial)();
});
exports.addBdayEvent_4 = addBdayEvent_4;
//Delete Welfare Event
const deleteEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const delevent = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(delevent.map((n) => [
        {
            text: n.eventName,
            callback_data: `delBdayEvent-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Select event to delete', {
        reply_markup: inlineKeyboard,
    });
});
exports.deleteEvent_1 = deleteEvent_1;
const deleteWelfareEvent_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = ctx.update.callback_query.data.substring('delBdayEvent-'.length);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`Are you sure you want to delete ${ctx.session.eventName}`, {
        reply_markup: inlineKeyboard,
    });
});
exports.deleteWelfareEvent_2 = deleteWelfareEvent_2;
const deleteWelfareEvent_Yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = new tableEntity_1.Events();
    event.eventName = ctx.session.eventName || '';
    const wishEvent = new tableEntity_1.Wishes();
    wishEvent.eventName = ctx.session.eventName || '';
    yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).delete(event);
    yield db_init_1.Database.getMongoRepository(tableEntity_1.Wishes).delete(wishEvent);
    yield ctx.reply(`${ctx.session.eventName} deleted!`);
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.deleteWelfareEvent_Yes = deleteWelfareEvent_Yes;
const deleteWelfareEvent_No = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply(`Deletion cancelled`);
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.deleteWelfareEvent_No = deleteWelfareEvent_No;
// export const editWelfareEvent = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const welfareEvent = await Database.getMongoRepository(Events).find({
//     eventTeam: 'Welfare',
//   });
//   const inlineKeyboard = new InlineKeyboard(
//     welfareEvent.map((w) => [
//       {
//         text: w.eventName,
//         callback_data: `editWelfareEvent-${w.eventName}`,
//       },
//     ])
//   );
//   await ctx.reply('Choose Welfare Event to edit', {
//     reply_markup: inlineKeyboard,
//   });
// };
// export const editWelfareEventMenu = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const name = ctx.update.callback_query.data.substring(
//     'editWelfareEvent-'.length
//   );
//   const getEvents = await Database.getMongoRepository(Events).find({
//     eventNames: name,
//   });
//   ctx.session.id = getEvents.map((n) => n.id)[0];
//   const inlineKeyboard = new InlineKeyboard([
//     [
//       {
//         text: 'Event Name',
//         callback_data: 'editWelfareEventName',
//       },
//     ],
//     [
//       {
//         text: 'Event Date',
//         callback_data: 'editWelfareEventDate',
//       },
//     ],
//     [
//       {
//         text: 'User that is not allowed to see',
//         callback_data: 'editWelfareNotAllowedUser',
//       },
//     ],
//     [
//       {
//         text: 'Back',
//         callback_data: 'manageWelfareEvent',
//       },
//     ],
//   ]);
//   await ctx.reply('Choose option to edit', {
//     reply_markup: inlineKeyboard,
//   });
// };
// export const editWelfareEventName_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   await ctx.reply('New event name :');
//   ctx.session.botOnType = 6;
// };
// //Uses botOntype = 6;
// export const editWelfareEventName_2 = async (
//   ctx: Filter<BotContext, 'message'>
// ) => {
//   ctx.session.botOnType = await undefined;
//   const newEventName = (await ctx.message.text) || '';
//   await Database.getMongoRepository(Events).updateOne(
//     { id: ctx.session.id },
//     { $set: { eventName: newEventName } }
//   );
//   await ctx.reply(`Event Name changed to ${newEventName}`);
//   ctx.session = await initial();
// };
// export const editWelfareEventDate_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   await ctx.reply('New event date in (dd/mm/yyyy) :');
//   ctx.session.botOnType = 7;
// };
// //Uses botOntype = 7;
// export const editWelfareEventDate_2 = async (
//   ctx: Filter<BotContext, 'message'>
// ) => {
//   ctx.session.botOnType = await undefined;
//   const newEventDate = (await ctx.message.text) || '';
//   await Database.getMongoRepository(Events).updateOne(
//     { id: ctx.session.id },
//     { $set: { eventDate: newEventDate } }
//   );
//   await ctx.reply(`Event Date changed to ${newEventDate}`);
//   ctx.session = await initial();
// };
// export const editWelfareNotAllowedUser_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const name = await Database.getRepository(Names).find();
//   const inlineKeyboard = new InlineKeyboard(
//     name.map((n) => [
//       {
//         text: n.nameText,
//         callback_data: `editNotAllowedUser-${n.nameText}`,
//       },
//     ])
//   );
//   await ctx.reply('Choose user', { reply_markup: inlineKeyboard });
// };
// export const editWelfareNotAllowedUser_2 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const selectedName = await ctx.update.callback_query.data.substring(
//     'editNotAllowedUser-'.length
//   );
//   await Database.getMongoRepository(Events).updateOne(
//     { id: ctx.session.id },
//     { $set: { notAllowedUser: selectedName } }
//   );
//   await ctx.reply(`Not allowed user changed to ${selectedName}`);
//   ctx.session = await initial();
// };
// //Welfare Team Memembers Management
// export const manageWelfareTeam = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const inlineKeyboard = new InlineKeyboard([
//     [
//       {
//         text: 'Add Member',
//         callback_data: 'addWelfareMember',
//       },
//     ],
//     [
//       {
//         text: 'Delete Member',
//         callback_data: 'delWelfareMember',
//       },
//     ],
//     [
//       {
//         text: 'Edit Member',
//         callback_data: 'editWelfareMember',
//       },
//     ],
//   ]);
//   const userList = await Database.getMongoRepository(Names).find({
//     where: {
//       role: { $in: ['welfare'] },
//     },
//   });
//   const icList = await Database.getMongoRepository(Names).find({
//     where: {
//       role: { $in: ['welfareIC'] },
//     },
//   });
//   await ctx.reply(
//     `Welfare Team\n\nIC:\n${icList
//       .map((n) => n.nameText)
//       .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`,
//     {
//       reply_markup: inlineKeyboard,
//     }
//   );
// };
// export const addWelfareMember_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const namelist = await Database.getMongoRepository(Names).find({
//     where: {
//       role: { $not: { $in: ['welfare', 'welfareIC'] } },
//     },
//   });
//   const inlineKeyboard = new InlineKeyboard(
//     namelist.map((w) => [
//       {
//         text: w.nameText,
//         callback_data: `addWelfareMember-${w.nameText}`,
//       },
//     ])
//   );
//   await ctx.reply('Choose user to add into team', {
//     reply_markup: inlineKeyboard,
//   });
// };
// export const addWelfareMember_2 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const selectedName = await ctx.update.callback_query.data.substring(
//     'addWelfareMember-'.length
//   );
//   const userRoleList = await (
//     await Database.getMongoRepository(Names).find({ nameText: selectedName })
//   )
//     .flatMap((n) => n.role)
//     .flat()
//     .concat(['welfare']);
//   console.log(userRoleList);
//   await Database.getMongoRepository(Names).updateOne(
//     { nameText: selectedName },
//     { $set: { role: userRoleList } }
//   );
//   await ctx.reply(`${selectedName} added into Welfare Team`);
// };
// export const delWelfareMember_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const namelist = await Database.getMongoRepository(Names).find({
//     where: {
//       role: { $in: ['welfare', 'welfareIC'] },
//     },
//   });
//   const inlineKeyboard = new InlineKeyboard(
//     namelist.map((w) => [
//       {
//         text: w.nameText,
//         callback_data: `delWelfareMember-${w.nameText}`,
//       },
//     ])
//   );
//   await ctx.reply('Choose user to remove from team', {
//     reply_markup: inlineKeyboard,
//   });
// };
// export const delWelfareMember_2 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const selectedName = await ctx.update.callback_query.data.substring(
//     'delWelfareMember-'.length
//   );
//   let userRoleList = await (
//     await Database.getMongoRepository(Names).find({ nameText: selectedName })
//   ).flatMap((n) => n.role);
//   if (userRoleList.includes('welfare')) {
//     await userRoleList.splice(userRoleList.indexOf('welfare', 1));
//   } else if (userRoleList.includes('welfareIC')) {
//     await userRoleList.splice(userRoleList.indexOf('welfareIC', 1));
//   }
//   await Database.getMongoRepository(Names).updateOne(
//     { nameText: selectedName },
//     { $set: { role: userRoleList } }
//   );
//   await ctx.reply(`${selectedName} removed from Welfare Team`);
// };
// export const editWelfareMember_1 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const namelist = await Database.getMongoRepository(Names).find({
//     where: {
//       role: { $in: ['welfare', 'welfareIC'] },
//     },
//   });
//   const inlineKeyboard = new InlineKeyboard(
//     namelist.map((w) => [
//       {
//         text: w.nameText,
//         callback_data: `editWelfareMember-${w.nameText}`,
//       },
//     ])
//   );
//   await ctx.reply('Choose user to IC/member from team', {
//     reply_markup: inlineKeyboard,
//   });
// };
// export const editWelfareMember_2 = async (
//   ctx: CallbackQueryContext<BotContext>
// ) => {
//   await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//   const selectedName = await ctx.update.callback_query.data.substring(
//     'editWelfareMember-'.length
//   );
//   let editRole = await (
//     await Database.getMongoRepository(Names).find({ nameText: selectedName })
//   ).flatMap((n) => n.role);
//   let changeRole = '';
//   if (editRole.includes('welfare')) {
//     await editRole.splice(editRole.indexOf('welfare', 1));
//     changeRole = 'Welfare IC';
//     await editRole.push('welfareIC');
//   } else if (editRole.includes('welfareIC')) {
//     await editRole.splice(editRole.indexOf('welfareIC', 1));
//     changeRole = 'Welfare Member';
//     await editRole.push('welfare');
//   }
//   await Database.getMongoRepository(Names).updateOne(
//     { nameText: selectedName },
//     { $set: { role: editRole } }
//   );
//   await ctx.reply(`${selectedName} changed to ${changeRole}`);
// };
