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
exports.adminWelfare = exports.sendWish = exports.sendsf = exports.settings = exports.help = exports.start = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const db_functions_1 = require("./db_functions");
/* / start command
 *  Purpose is to tag the username with the name list inside the "names" collection within UnshakeableDB
 */
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield db_init_1.Database.getRepository(tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `nameStart-${n.nameText}`,
        },
    ]));
    yield ctx.reply('Welcome to Unshakeable Telegram Bot\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
});
exports.start = start;
const help = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(`
	Help List
  \nIf there is any issue within the Bot or any feedback pls pm @whysominh for technical help ☺️
  \n/help --> Help List
  \n/settings --> Settings list
  \n/sendsf --> Send sermon feedback for the week
	\n/sendwish -->  Send wishes to upcoming welfare events
	\n/adminwelfare --> Management of admin for Welfare Team (only accessible to serving members)
  \n/adminbday --> Management of admin for Bday Team (only accessible to serving members)
  \n/adminsf --> Management of sermon feedback for Admin Team (only accessible to serving members)
	`);
});
exports.help = help;
const settings = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Settings (in development)');
});
exports.settings = settings;
const sendsf = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Yes',
                callback_data: 'AttendanceSF-yes',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'AttendanceSF-no',
            },
        ],
    ]);
    yield ctx.reply(`Hi there! We will be collecting sermon feedback every week!
  \nFor those who have no clue on what to write for sermon feedback, you can share about what you learnt from the sermon or comment on the entire service in general. Feel free to express your thoughts on the service! You are strongly encouraged to write sermon feedback because they benefit both you and the preacher. :-)
  \nPlease fill up this by SUNDAY, 7 PM!
  \n\nDid you attend service/watched online?
  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.sendsf = sendsf;
const sendWish = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield db_init_1.Database.getMongoRepository(tableEntity_1.Events).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((e) => [
        {
            text: e.eventName,
            callback_data: `eventName-${e.eventName}`,
        },
    ]));
    yield ctx.reply('Choose upcoming Welfare Event ', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendWish = sendWish;
const adminWelfare = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const access = yield (0, db_functions_1.roleAccess)(['welfare', 'welfareIC'], ctx);
    if (access) {
        const inlineKeyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Manage Welfare Events',
                    callback_data: 'manageWelfareEvent',
                },
            ],
            [
                {
                    text: 'Manage Welfare Team',
                    callback_data: 'manageWelfareTeam',
                },
            ],
            [
                {
                    text: 'See Wishes',
                    callback_data: 'seeWelfareWishes',
                },
            ],
            [
                {
                    text: 'Send Reminder',
                    callback_data: 'manageReminder',
                },
            ],
        ]);
        yield ctx.reply(`
	Welfare Team Admin Matters

	\nWelfare Team and Event Management can only be used by Welfare IC / IT Rep (for technical purposes only)
	\nAll members can view all wishes and send reminders in all welfare events
	\nPlease respect the privacy of LG members by only using the information when deemed necessary.
	\nPlease also do not abuse the reminder system and annoy your fellow lifegroup members
	`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('Sorry you are not a member of Welfare.\nTherefore, due to privacy reasons, we cannot grant you access.\nThank you for your understanding');
    }
});
exports.adminWelfare = adminWelfare;
