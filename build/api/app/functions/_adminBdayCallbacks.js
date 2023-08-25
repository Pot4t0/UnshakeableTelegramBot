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
exports.editMember_2 = exports.editMember_1 = exports.delMember_2 = exports.delMember_1 = exports.addMember_2 = exports.addMember_1 = exports.manageTeam = exports.editNotAllowedUser_2 = exports.editNotAllowedUser_1 = exports.editEventDate_2 = exports.editEventDate_1 = exports.editEventName_2 = exports.editEventName_1 = exports.editEventMenu = exports.editEvent = exports.deleteEvent_No = exports.deleteEvent_Yes = exports.deleteEvent_2 = exports.deleteEvent_1 = exports.addBdayEvent_4 = exports.addBdayEvent_3 = exports.addBdayEvent_2 = exports.addBdayEvent_1 = exports.seeEvents = exports.manageEvent = exports.sendSpecificReminder_4 = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = exports.seeWish_2 = exports.seeWish_1 = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_functions_1 = require("./_db_functions");
const _SessionData_1 = require("../models/_SessionData");
// See Wish Callbacks
const seeWish_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const welfareEvent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
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
    const WishArray = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
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
		\n(Send all option will exclude the person its for)

		\nDO NOT ABUSE THE REMINDER SYSTEM.
	  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.reminderManagement = reminderManagement;
const sendNotInReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
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
    \nSuggestion to put /sendwish so that user can click on it
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
    const inWishes = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
        where: {
            eventName: { $eq: ctx.session.eventName },
        },
    });
    const notInNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            teleUser: { $not: { $in: inWishes.map((n) => `${n.teleUser}`) } },
        },
    });
    const notInUsers = notInNames
        .map((n) => `${n.teleUser}`)
        .filter((n) => n != '');
    for (let i = 0; i < notInUsers.length; i++) {
        yield (0, _db_functions_1.sendMessageUser)(notInUsers[i], reminder, ctx);
    }
    yield ctx.reply(`Reminder sent!`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendNotInReminder_3 = sendNotInReminder_3;
//Send Specific Person Reminder Msg
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
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
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
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
    \nSuggestion to put /sendwish so that user can click on it
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
        yield (0, _db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
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
    const allWelfareEvents = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
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
    ctx.session = yield (0, _SessionData_1.initial)();
    ctx.session.eventName = (yield ctx.message.text) || '';
    ctx.reply('Deadline of the event put in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 13;
});
exports.addBdayEvent_2 = addBdayEvent_2;
//botOntype = 13
const addBdayEvent_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    ctx.session.eventDate = (yield ctx.message.text) || '';
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
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
    const event = new _tableEntity_1.Events();
    event.eventName = ctx.session.eventName || '';
    event.eventDate = ctx.session.eventDate || '';
    event.eventTeam = 'Bday';
    if (name != 'ALL') {
        event.notAllowedUser = name;
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).save(event);
    yield ctx.reply(`${ctx.session.eventName} (Birthday Event) added!`);
    ctx.session = (0, _SessionData_1.initial)();
});
exports.addBdayEvent_4 = addBdayEvent_4;
//Delete Welfare Event
const deleteEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const delevent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
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
const deleteEvent_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.deleteEvent_2 = deleteEvent_2;
const deleteEvent_Yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = new _tableEntity_1.Events();
    event.eventName = ctx.session.eventName || '';
    const wishEvent = new _tableEntity_1.Wishes();
    wishEvent.eventName = ctx.session.eventName || '';
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).delete(event);
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).delete(wishEvent);
    yield ctx.reply(`${ctx.session.eventName} deleted!`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.deleteEvent_Yes = deleteEvent_Yes;
const deleteEvent_No = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply(`Deletion cancelled`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.deleteEvent_No = deleteEvent_No;
const editEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const bdayEvent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Bday',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(bdayEvent.map((w) => [
        {
            text: w.eventName,
            callback_data: `editBdayEvent-${w.eventName}`,
        },
    ]));
    yield ctx.reply('Choose Birthday Event to edit', {
        reply_markup: inlineKeyboard,
    });
});
exports.editEvent = editEvent;
const editEventMenu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = ctx.update.callback_query.data.substring('editBdayEvent-'.length);
    const getEvents = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventName: name,
    });
    ctx.session.id = getEvents.map((n) => n.id)[0];
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply('Choose option to edit', {
        reply_markup: inlineKeyboard,
    });
});
exports.editEventMenu = editEventMenu;
const editEventName_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('New event name :', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 14;
});
exports.editEventName_1 = editEventName_1;
//Uses botOntype = 14;
const editEventName_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const newEventName = (yield ctx.message.text) || '';
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventName: newEventName } });
    yield ctx.reply(`Event Name changed to ${newEventName}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editEventName_2 = editEventName_2;
const editEventDate_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('New event date in (dd/mm/yyyy) :', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 15;
});
exports.editEventDate_1 = editEventDate_1;
//Uses botOntype = 15;
const editEventDate_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const newEventDate = (yield ctx.message.text) || '';
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventDate: newEventDate } });
    yield ctx.reply(`Event Date changed to ${newEventDate}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editEventDate_2 = editEventDate_2;
const editNotAllowedUser_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `editBdayNotAllowedUser-${n.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user', { reply_markup: inlineKeyboard });
});
exports.editNotAllowedUser_1 = editNotAllowedUser_1;
const editNotAllowedUser_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('editBdayNotAllowedUser-'.length);
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { notAllowedUser: selectedName } });
    yield ctx.reply(`Not allowed user changed to ${selectedName}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editNotAllowedUser_2 = editNotAllowedUser_2;
//Bday Team Memembers Management
const manageTeam = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    const userList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['bday'] },
        },
    });
    const icList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['bdayIC'] },
        },
    });
    yield ctx.reply(`Birthday Team\n\nIC:\n${icList
        .map((n) => n.nameText)
        .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`, {
        reply_markup: inlineKeyboard,
    });
});
exports.manageTeam = manageTeam;
const addMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $not: { $in: ['bday', 'bdayIC'] } },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `addBdayMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to add into team', {
        reply_markup: inlineKeyboard,
    });
});
exports.addMember_1 = addMember_1;
const addMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('addBdayMember-'.length);
    const userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName }))
        .flatMap((n) => n.role)
        .flat()
        .concat(['bday']);
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
    yield ctx.reply(`${selectedName} added into Birthday Team`);
});
exports.addMember_2 = addMember_2;
const delMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['bday', 'bdayIC'] },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `delBdayMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to remove from team', {
        reply_markup: inlineKeyboard,
    });
});
exports.delMember_1 = delMember_1;
const delMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('delBdayMember-'.length);
    let userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
    if (userRoleList.includes('bday')) {
        yield userRoleList.splice(userRoleList.indexOf('bday', 1));
    }
    else if (userRoleList.includes('welfareIC')) {
        yield userRoleList.splice(userRoleList.indexOf('bdayIC', 1));
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
    yield ctx.reply(`${selectedName} removed from Welfare Team`);
});
exports.delMember_2 = delMember_2;
const editMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['bday', 'bdayIC'] },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `editBdayMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to IC/member from team', {
        reply_markup: inlineKeyboard,
    });
});
exports.editMember_1 = editMember_1;
const editMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('editBdayMember-'.length);
    let editRole = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
    let changeRole = '';
    if (editRole.includes('bday')) {
        yield editRole.splice(editRole.indexOf('bday', 1));
        changeRole = 'Birthday IC';
        yield editRole.push('bdayIC');
    }
    else if (editRole.includes('bdayIC')) {
        yield editRole.splice(editRole.indexOf('bdayIC', 1));
        changeRole = 'Birthday Member';
        yield editRole.push('bday');
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: editRole } });
    yield ctx.reply(`${selectedName} changed to ${changeRole}`);
});
exports.editMember_2 = editMember_2;
