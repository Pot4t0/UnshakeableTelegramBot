"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editEventDate_Execution = exports.editEventName_Execution = exports.addEvent_ReceiveEventDate = exports.addEvent_ReceiveEventName = exports.eventManagement = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _telefunctions_1 = require("../../app/_telefunctions");
//Events Database - Contains all events
//Functions to manage events limited to each team (Birthday / Welfare)
//Add, Delete, Edit, View
//Add CallbackQuery: add{team}Events
//Delete CallbackQuery: del{team}Events
//Edit CallbackQuery: edit{team}Events
//View CallbackQuery: see{team}Events
const eventManagement = async (bot, team) => {
    bot.callbackQuery(`manage${team}Event`, _telefunctions_1.loadFunction, (ctx) => eventManageMenu(ctx, team));
    bot.callbackQuery(`see${team}Events`, _telefunctions_1.loadFunction, (ctx) => eventView(ctx, team));
    addEvent(bot, team);
    delEvent(bot, team);
    editEvent(bot, team);
};
exports.eventManagement = eventManagement;
const eventManageMenu = async (ctx, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    await ctx.reply(`<b>${team} Event Management</b>\n\nSelect an option below:`, {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
    });
};
const eventView = async (ctx, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    let eventTeam;
    if (team == 'Welfare') {
        eventTeam = 'Welfare';
    }
    else {
        eventTeam = 'Bday';
    }
    const currentUser = ctx.callbackQuery.from.username;
    const allEvents = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: eventTeam,
    });
    const currentUserName = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: currentUser,
    });
    if (!currentUserName) {
        await ctx.reply(`You are not in the database. Please contact the admin to add you in the database`);
        return;
    }
    const eventListed = allEvents.map((n) => {
        if (currentUserName.nameText != n.notAllowedUser) {
            return `${n.eventName}\n\nDeadline: ${n.eventDate}\nNot Allowed User: ${n.notAllowedUser}`;
        }
    });
    await ctx.reply(eventListed.join('\n\n'));
};
const addEvent = async (bot, team) => {
    bot.callbackQuery(`add${team}Events`, (ctx) => addEvent_Init(ctx, team));
    bot.callbackQuery(/^createEvent-/g, (ctx) => addEvent_CreateEvent(ctx, ctx.update.callback_query.data.substring(`createEvent-`.length)));
};
const addEvent_Init = async (ctx, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    ctx.session.name = team;
    ctx.reply(`Input ${team} event Name\ne.g. Minh's ORD`, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 4;
};
//Used in _botOn_functions.ts in botOntype = 4
const addEvent_ReceiveEventName = async (ctx) => {
    ctx.session.eventName = ctx.message.text;
    if (ctx.session.eventName == null) {
        (0, exports.addEvent_ReceiveEventName)(ctx);
    }
    ctx.reply('Deadline of wish collection (dd/mm/yyyy): ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 5;
};
exports.addEvent_ReceiveEventName = addEvent_ReceiveEventName;
//Used in _botOn_functions.ts in botOntype = 5
const addEvent_ReceiveEventDate = async (ctx) => {
    ctx.session.eventDate = await ctx.message.text;
    if (ctx.session.eventDate == null) {
        (0, exports.addEvent_ReceiveEventDate)(ctx);
    }
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name
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
    ]));
    await ctx.reply('Select the person to exclude in seeing this event', {
        reply_markup: inlineKeyboard,
    });
};
exports.addEvent_ReceiveEventDate = addEvent_ReceiveEventDate;
const addEvent_CreateEvent = async (ctx, notAllowedUser) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const team = ctx.session.name;
    const eventName = ctx.session.eventName;
    const eventDate = ctx.session.eventDate;
    let eventTeam;
    if (team == 'Welfare') {
        eventTeam = 'Welfare';
    }
    else {
        eventTeam = 'Bday';
    }
    if (team && eventName && eventDate) {
        const event = new _tableEntity_1.Events();
        event.eventName = eventName;
        event.eventDate = eventDate;
        event.eventTeam = eventTeam;
        if (notAllowedUser != 'ALL') {
            event.notAllowedUser = notAllowedUser;
        }
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).save(event);
        await ctx.reply(`${eventName} (${team} Event) added!`);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
const delEvent = async (bot, team) => {
    let eventName;
    bot.callbackQuery(`del${team}Events`, async (ctx) => await delEvent_EventMenu(ctx, team));
    bot.callbackQuery(/^delEventName/g, async (ctx) => {
        eventName = ctx.update.callback_query.data.substring('delEventName-'.length);
        await delEvent_CfmMsg(ctx, eventName);
    });
    bot.callbackQuery(/^cfmDelEvent-/g, (ctx) => delEvent_PerformDeletion(ctx, ctx.update.callback_query.data.substring('cfmDelEvent-'.length), eventName));
};
const delEvent_EventMenu = async (ctx, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    let eventTeam;
    if (team == 'Birthday') {
        eventTeam = 'Bday';
    }
    else {
        eventTeam = 'Welfare';
    }
    const event = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: eventTeam,
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `delEventName-${n.eventName}`,
        },
    ]));
    await ctx.reply(`Choose ${team} Event to delete`, {
        reply_markup: inlineKeyboard,
    });
};
const delEvent_CfmMsg = async (ctx, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
const delEvent_PerformDeletion = async (ctx, choice, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    if (eventName) {
        if (choice == 'Y') {
            const event = new _tableEntity_1.Events();
            event.eventName = eventName;
            const wishEvent = new _tableEntity_1.Wishes();
            wishEvent.eventName = eventName;
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).delete(event);
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).delete(wishEvent);
            await ctx.reply(`${eventName} deleted!`);
        }
        else if (choice == 'N') {
            await ctx.reply(`Deletion cancelled`);
        }
        else {
            await ctx.reply(`Error in deletion! Please try again`);
        }
    }
    else {
        await ctx.reply(`Error in deletion! Please try again`);
        console.log('Session data not found! (eventName)');
    }
    ctx.session = (0, _SessionData_1.initial)();
};
const editEvent = async (bot, team) => {
    let eventName;
    bot.callbackQuery(`edit${team}Events`, (ctx) => editEvent_Init(ctx, team));
    bot.callbackQuery(/^editEventMenu-/g, (ctx) => {
        eventName = ctx.update.callback_query.data.substring('editEventMenu-'.length);
        editEvent_EditMenu(ctx, eventName, team);
    });
    bot.callbackQuery('editEventName', (ctx) => editEventName(ctx, eventName));
    bot.callbackQuery('editEventDate', (ctx) => editEventDate(ctx));
    bot.callbackQuery('editNotAllowedUser', (ctx) => editNotAllowedUser(ctx, eventName));
    bot.callbackQuery(/^editNotAllowedUserSelect-/g, (ctx) => editNotAllowedUser_Execution(ctx, eventName));
};
const editEvent_Init = async (ctx, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    let eventTeam;
    if (team == 'Birthday') {
        eventTeam = 'Bday';
    }
    else {
        eventTeam = 'Welfare';
    }
    const event = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: eventTeam,
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((w) => [
        {
            text: w.eventName,
            callback_data: `editEventMenu-${w.eventName}`,
        },
    ]));
    await ctx.reply(`Choose ${team} Event to edit`, {
        reply_markup: inlineKeyboard,
    });
};
const editEvent_EditMenu = async (ctx, eventName, team) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const getEvents = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventName: eventName,
    });
    ctx.session.id = getEvents.map((n) => n.id)[0];
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
const editEventName = async (ctx, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply(`The current event name is <b>${eventName}</b>\n What would like to change it to?`, {
        parse_mode: 'HTML',
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 6;
};
//Used in _botOn_functions.ts in botOntype = 6
const editEventName_Execution = async (ctx) => {
    const newEventName = await ctx.message.text;
    if (newEventName == null) {
        (0, exports.editEventName_Execution)(ctx);
    }
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventName: newEventName } });
    await ctx.reply(`Event Name changed to ${newEventName}`);
    ctx.session = (0, _SessionData_1.initial)();
};
exports.editEventName_Execution = editEventName_Execution;
const editEventDate = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Change event date to: (dd/mm/yyyy) :', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 7;
};
//Used in _botOn_functions.ts in botOntype = 7
const editEventDate_Execution = async (ctx) => {
    const newEventDate = await ctx.message.text;
    if (newEventDate == null) {
        (0, exports.editEventDate_Execution)(ctx);
    }
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { eventDate: newEventDate } });
    await ctx.reply(`Event Date changed to ${newEventDate}`);
    ctx.session = (0, _SessionData_1.initial)();
};
exports.editEventDate_Execution = editEventDate_Execution;
const editNotAllowedUser = async (ctx, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name
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
    ]));
    await ctx.reply(`Choose new user to exclude from ${eventName}`, {
        reply_markup: inlineKeyboard,
    });
};
const editNotAllowedUser_Execution = async (ctx, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    let selectedName = ctx.update.callback_query.data.substring('editNotAllowedUserSelect-'.length);
    if (selectedName == 'ALL') {
        selectedName = '';
    }
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).updateOne({ _id: ctx.session.id }, { $set: { notAllowedUser: selectedName } });
    if (selectedName == '') {
        await ctx.reply(`Everyone is allowed to see ${eventName}`);
    }
    else {
        await ctx.reply(`User ${selectedName} is excluded from ${eventName}`);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
