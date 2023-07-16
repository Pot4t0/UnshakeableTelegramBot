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
exports.wishTable = exports.seeWish = exports.wishManagement = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database/db-init");
const tableEntity_1 = require("../database/Entity/tableEntity");
const wishManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: "See Wishes",
                callback_data: "seewish"
            }
        ], [
            {
                "text": "Remove Wishes",
                "callback_data": "removewish"
            }
        ], [
            {
                "text": "Export Wishes (in developnent)",
                "callback_data": "exportwish"
            }
        ], [
            {
                "text": "Track members that have not sent wishes (in developnent)",
                "callback_data": "trackwish"
            }
        ], [
            {
                "text": "Remind members to send wish (in developnent)",
                "callback_data": "remindwish"
            }
        ]
    ]);
    yield ctx.reply(`
	Select option you want to use: 
	`, {
        reply_markup: inlineKeyboard
    });
});
exports.wishManagement = wishManagement;
const seeWish = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield db_init_1.Database.getRepository(tableEntity_1.EventTable).find();
    //await query.select("eventTable", "name");
    const inlineKeyboard = new grammy_1.InlineKeyboard(events.map(event => [{
            text: event.name,
            callback_data: `wishEvent-${event.name}`
        }]));
    yield ctx.reply("Choose upcoming Welfare Event", {
        reply_markup: inlineKeyboard
    });
});
exports.seeWish = seeWish;
const wishTable = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const eventName = ctx.update.callback_query.data.substring('wishEvent'.length + 1);
    let wish = yield db_init_1.Database.getRepository(tableEntity_1.WishTable).find({ where: { eventName } });
    let wish_formatted = eventName + ' Wishes\n\n' + wish.map(w => [`Name: ${w.name}`, `Wish: ${w.wish}`].join("\n")).join('\n\n');
    // query.select(`wishTable WHERE eventName = "${eventName}"`,"name, wish" );
    const inlineKeyboard = new grammy_1.InlineKeyboard([[{ "text": "Back", "callback_data": "wishManagement" }]]);
    yield ctx.reply(wish_formatted, {
        reply_markup: inlineKeyboard
    });
});
exports.wishTable = wishTable;
