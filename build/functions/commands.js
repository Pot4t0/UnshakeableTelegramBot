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
exports.admin = exports.sendWish = exports.settings = exports.help = exports.start = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database/db-init");
const tableEntity_1 = require("../database/Entity/tableEntity");
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Welcome to UnShakeable Welfare Telegram Bot");
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
    yield ctx.reply("Settings (in development)");
});
exports.settings = settings;
const sendWish = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield db_init_1.Database.getRepository(tableEntity_1.EventTable).find();
    // query.select("eventTable", "name");
    const inlineKeyboard = new grammy_1.InlineKeyboard(events.map(event => [{
            text: event.name,
            callback_data: `eventName-${event.name}`
        }]));
    yield ctx.reply("Choose upcoming Welfare Event ", {
        reply_markup: inlineKeyboard
    });
});
exports.sendWish = sendWish;
const admin = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                "text": "Mangement of Wish Database Table",
                "callback_data": "wishManagement"
            }
        ], [
            {
                "text": "Management of Unshakeable Members (in development)",
                "callback_data": "nameManagement"
            }
        ], [
            {
                "text": "Management of Welfare Events(in development)",
                "callback_data": "eventManagement"
            }
        ], [
            {
                "text": "Management of Welfare Financial Matters(in development)",
                "callback_data": "financeManagement"
            }
        ]
    ]);
    yield ctx.reply(`
	Welfare Team Admin Matters
	
	Pls take not that this is still experimental as such many functions may not work 100%. If there are any issues pls feedback to developer (Minh). He will OTOT settle it
	`, {
        reply_markup: inlineKeyboard
    });
});
exports.admin = admin;
