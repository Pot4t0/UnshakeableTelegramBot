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
exports.FinalReply = exports.NameReply = exports.EventReply = void 0;
const grammy_1 = require("grammy");
const SessionData_1 = require("../models/SessionData");
const db_init_1 = require("../database/db-init");
const tableEntity_1 = require("../database/Entity/tableEntity");
const EventReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = ctx.update.callback_query.data.substring('eventName-'.length);
    ctx.session.eventName = event;
    const names = yield db_init_1.Database.getRepository(tableEntity_1.NameTable).find();
    // query.select("nameTable", "text");
    const inlineKeyboard = new grammy_1.InlineKeyboard(names.map(n => [{
            text: n.text,
            callback_data: `name-${n.text}`
        }]));
    yield ctx.answerCallbackQuery({
        text: event,
    });
    yield ctx.reply("Select your name ", {
        reply_markup: inlineKeyboard
    });
});
exports.EventReply = EventReply;
const NameReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const name = ctx.update.callback_query.data.substring('name-'.length);
    ctx.session.name = name;
    yield ctx.answerCallbackQuery({
        text: name,
    });
    yield ctx.reply("Send a msg that contains your wish ", {
        reply_markup: {
            force_reply: true
        }
    });
});
exports.NameReply = NameReply;
const FinalReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.eventName && ctx.session.name) {
        try {
            const wish = ctx.message.text || '';
            ctx.session.wish = wish;
            const eventName = ctx.session.eventName;
            const name = ctx.session.name;
            const wishSent = yield db_init_1.Database.getRepository(tableEntity_1.WishTable).save({
                eventName,
                name,
                wish
            });
            // query.insert("wishTable", ['eventName','name', 'wish'], [eventName,name,wish]);
            ctx.reply("Wish Received");
            ctx.session = (0, SessionData_1.initial)();
        }
        catch (err) {
            console.log(err);
        }
    }
});
exports.FinalReply = FinalReply;
