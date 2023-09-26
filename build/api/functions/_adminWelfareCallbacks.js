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
exports.editWelfareMember_2 = exports.editWelfareMember_1 = exports.delWelfareMember_2 = exports.delWelfareMember_1 = exports.addWelfareMember_2 = exports.addWelfareMember_1 = exports.manageWelfareTeam = exports.editWelfareNotAllowedUser_2 = exports.editWelfareNotAllowedUser_1 = exports.editWelfareEventDate_2 = exports.editWelfareEventDate_1 = exports.editWelfareEventName_2 = exports.editWelfareEventName_1 = exports.editWelfareEventMenu = exports.editWelfareEvent = exports.deleteWelfareEvent_No = exports.deleteWelfareEvent_Yes = exports.deleteWelfareEvent_2 = exports.deleteWelfareEvent_1 = exports.addWelfareEvent_4 = exports.addWelfareEvent_3 = exports.addWelfareEvent_2 = exports.addWelfareEvent_1 = exports.seeWelfareEvents = exports.manageWelfareEvent = exports.sendSpecificReminder_4 = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = exports.seeWish_2 = exports.seeWish_1 = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_functions_1 = require("./_db_functions");
const _SessionData_1 = require("../models/_SessionData");
// See Wish Callbacks
const seeWish_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const welfareEvent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const wishNumber = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes);
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).count();
    const inlineKeyboard = new grammy_1.InlineKeyboard(yield Promise.all(welfareEvent.map((event) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            {
                text: `${event.eventName}  ( ${(yield wishNumber.find({ eventName: event.eventName })).length} / ${totalNames} )`,
                callback_data: `welfareWish_1-${event.eventName}`,
            },
        ];
    }))));
    yield ctx.reply('Select Welfare Event', {
        reply_markup: inlineKeyboard,
    });
});
exports.seeWish_1 = seeWish_1;
const seeWish_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = ctx.update.callback_query.data.substring('welfareWish_1-'.length);
    const welfareWishArray = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
        eventName: callback,
    });
    const wishTable = yield welfareWishArray.map((n) => `@${n.teleUser}\nWish: \n${n.wishText}`);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [{ text: 'Back', callback_data: 'seeWelfareWishes' }],
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
        eventTeam: 'Welfare',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `reminderNotInEvents-${n.eventName}`,
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
    ctx.session.botOnType = 3;
    yield ctx.reply(`Write down the reminder msg for people that have not sent it in
    \nSuggestion to put /sendwish so that user can click on it
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendNotInReminder_2 = sendNotInReminder_2;
//Uses botOnType = 3 to work
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
    yield Promise.all(notInUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, _db_functions_1.sendMessageUser)(n, reminder, ctx);
    })));
    yield ctx.reply(`Reminder sent!`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendNotInReminder_3 = sendNotInReminder_3;
//Send Specific Person Reminder Msg
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const event = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `reminderSpecificEvents-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Choose event:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_1 = sendSpecificReminder_1;
const sendSpecificReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = ctx.update.callback_query.data.substring('reminderSpecificEvents-'.length);
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `reminderSpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_2 = sendSpecificReminder_2;
const sendSpecificReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderSpecificNames-'.length);
    ctx.session.reminderUser = telegramUser;
    ctx.session.botOnType = 2;
    yield ctx.reply(`Write down the reminder msg that you want to send to @${telegramUser}
    \nSuggestion to put /sendwish so that user can click on it
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
//Uses botOnType = 2 to work
const sendSpecificReminder_4 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.reminderUser) {
        const reminder = (yield ctx.message.text) || '';
        yield (0, _db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendSpecificReminder_4 = sendSpecificReminder_4;
//Manage Welfare Events
const manageWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
		  Choose option
		  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.manageWelfareEvent = manageWelfareEvent;
//See Welfare Events
const seeWelfareEvents = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const allWelfareEvents = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const eventListed = yield allWelfareEvents.map((n) => `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`);
    yield ctx.reply(eventListed.join('\n\n'));
});
exports.seeWelfareEvents = seeWelfareEvents;
//Add Welfare Event Callback
const addWelfareEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.reply('Input Welfare event Name', {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 4;
});
exports.addWelfareEvent_1 = addWelfareEvent_1;
const addWelfareEvent_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session = yield (0, _SessionData_1.initial)();
    ctx.session.eventName = (yield ctx.message.text) || '';
    ctx.reply('Deadline of the event put in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 5;
});
exports.addWelfareEvent_2 = addWelfareEvent_2;
const addWelfareEvent_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    ctx.session.eventDate = (yield ctx.message.text) || '';
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name
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
    ]));
    yield ctx.reply('Select person to not be able to see this event', {
        reply_markup: inlineKeyboard,
    });
});
exports.addWelfareEvent_3 = addWelfareEvent_3;
const addWelfareEvent_4 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = ctx.update.callback_query.data.substring('nameAddWelfareEvent-'.length);
    const event = new _tableEntity_1.Events();
    event.eventName = ctx.session.eventName || '';
    event.eventDate = ctx.session.eventDate || '';
    event.eventTeam = 'Welfare';
    if (name != 'ALL') {
        event.notAllowedUser = name;
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).save(event);
    yield ctx.reply(`${ctx.session.eventName} (Welfare Event) added!`);
    ctx.session = (0, _SessionData_1.initial)();
});
exports.addWelfareEvent_4 = addWelfareEvent_4;
//Delete Welfare Event
const deleteWelfareEvent_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const delevent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(delevent.map((n) => [
        {
            text: n.eventName,
            callback_data: `delWelfareEvent-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Select event to delete', {
        reply_markup: inlineKeyboard,
    });
});
exports.deleteWelfareEvent_1 = deleteWelfareEvent_1;
const deleteWelfareEvent_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = ctx.update.callback_query.data.substring('delWelfareEvent-'.length);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`Are you sure you want to delete ${ctx.session.eventName}`, {
        reply_markup: inlineKeyboard,
    });
});
exports.deleteWelfareEvent_2 = deleteWelfareEvent_2;
const deleteWelfareEvent_Yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.deleteWelfareEvent_Yes = deleteWelfareEvent_Yes;
const deleteWelfareEvent_No = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply(`Deletion cancelled`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.deleteWelfareEvent_No = deleteWelfareEvent_No;
const editWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const welfareEvent = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: 'Welfare',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(welfareEvent.map((w) => [
        {
            text: w.eventName,
            callback_data: `editWelfareEvent-${w.eventName}`,
        },
    ]));
    yield ctx.reply('Choose Welfare Event to edit', {
        reply_markup: inlineKeyboard,
    });
});
exports.editWelfareEvent = editWelfareEvent;
const editWelfareEventMenu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = ctx.update.callback_query.data.substring('editWelfareEvent-'.length);
    const getEvents = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventName: name,
    });
    ctx.session.id = getEvents.map((n) => n.id)[0];
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply('Choose option to edit', {
        reply_markup: inlineKeyboard,
    });
});
exports.editWelfareEventMenu = editWelfareEventMenu;
const editWelfareEventName_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('New event name :', { reply_markup: { force_reply: true } });
    ctx.session.botOnType = 6;
});
exports.editWelfareEventName_1 = editWelfareEventName_1;
//Uses botOntype = 6;
const editWelfareEventName_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const newEventName = (yield ctx.message.text) || '';
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventName: newEventName } });
    yield ctx.reply(`Event Name changed to ${newEventName}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editWelfareEventName_2 = editWelfareEventName_2;
const editWelfareEventDate_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('New event date in (dd/mm/yyyy) :', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 7;
});
exports.editWelfareEventDate_1 = editWelfareEventDate_1;
//Uses botOntype = 7;
const editWelfareEventDate_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    const newEventDate = (yield ctx.message.text) || '';
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventDate: newEventDate } });
    yield ctx.reply(`Event Date changed to ${newEventDate}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editWelfareEventDate_2 = editWelfareEventDate_2;
const editWelfareNotAllowedUser_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `editNotAllowedUser-${n.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user', { reply_markup: inlineKeyboard });
});
exports.editWelfareNotAllowedUser_1 = editWelfareNotAllowedUser_1;
const editWelfareNotAllowedUser_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('editNotAllowedUser-'.length);
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { notAllowedUser: selectedName } });
    yield ctx.reply(`Not allowed user changed to ${selectedName}`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.editWelfareNotAllowedUser_2 = editWelfareNotAllowedUser_2;
//Welfare Team Memembers Management
const manageWelfareTeam = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    const userList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['welfare'] },
        },
    });
    const icList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['welfareIC'] },
        },
    });
    yield ctx.reply(`Welfare Team\n\nIC:\n${icList
        .map((n) => n.nameText)
        .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`, {
        reply_markup: inlineKeyboard,
    });
});
exports.manageWelfareTeam = manageWelfareTeam;
const addWelfareMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $not: { $in: ['welfare', 'welfareIC'] } },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `addWelfareMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to add into team', {
        reply_markup: inlineKeyboard,
    });
});
exports.addWelfareMember_1 = addWelfareMember_1;
const addWelfareMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('addWelfareMember-'.length);
    const userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName }))
        .flatMap((n) => n.role)
        .flat()
        .concat(['welfare']);
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
    yield ctx.reply(`${selectedName} added into Welfare Team`);
});
exports.addWelfareMember_2 = addWelfareMember_2;
const delWelfareMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['welfare', 'welfareIC'] },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `delWelfareMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to remove from team', {
        reply_markup: inlineKeyboard,
    });
});
exports.delWelfareMember_1 = delWelfareMember_1;
const delWelfareMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('delWelfareMember-'.length);
    let userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
    if (userRoleList.includes('welfare')) {
        yield userRoleList.splice(userRoleList.indexOf('welfare', 1));
    }
    else if (userRoleList.includes('welfareIC')) {
        yield userRoleList.splice(userRoleList.indexOf('welfareIC', 1));
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
    yield ctx.reply(`${selectedName} removed from Welfare Team`);
});
exports.delWelfareMember_2 = delWelfareMember_2;
const editWelfareMember_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            role: { $in: ['welfare', 'welfareIC'] },
        },
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
        {
            text: w.nameText,
            callback_data: `editWelfareMember-${w.nameText}`,
        },
    ]));
    yield ctx.reply('Choose user to IC/member from team', {
        reply_markup: inlineKeyboard,
    });
});
exports.editWelfareMember_1 = editWelfareMember_1;
const editWelfareMember_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const selectedName = yield ctx.update.callback_query.data.substring('editWelfareMember-'.length);
    let editRole = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
    let changeRole = '';
    if (editRole.includes('welfare')) {
        yield editRole.splice(editRole.indexOf('welfare', 1));
        changeRole = 'Welfare IC';
        yield editRole.push('welfareIC');
    }
    else if (editRole.includes('welfareIC')) {
        yield editRole.splice(editRole.indexOf('welfareIC', 1));
        changeRole = 'Welfare Member';
        yield editRole.push('welfare');
    }
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: editRole } });
    yield ctx.reply(`${selectedName} changed to ${changeRole}`);
});
exports.editWelfareMember_2 = editWelfareMember_2;
