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
exports.adminWelfare = exports.sendWish = exports.settings = exports.help = exports.start = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
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
	/sendwish -->  Send wishes to upcoming welfare events
	/admin --> Management of resources/data within this telegram bot (FOR WELFARE TEAM ONLY)
	`);
});
exports.help = help;
const settings = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Settings (in development)');
});
exports.settings = settings;
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

	Welfare Team and Event Management can only be used by Welfare IC / IT Rep (for technical purposes only)
	All members can view all wishes and send reminders in all welfare events
	Please respect the privacy of LG members by only using the information when deemed necessary.
	Please also do not abuse the reminder system and annoy your fellow lifegroup members
	`, {
        reply_markup: inlineKeyboard,
    });
});
exports.adminWelfare = adminWelfare;
