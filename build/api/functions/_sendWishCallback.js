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
exports.FinalReply = exports.EventReply = void 0;
const _db_init_1 = require("../database_mongoDB/_db-init");
const _SessionData_1 = require("../models/_SessionData");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const EventReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = ctx.update.callback_query.data.substring('eventName-'.length);
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = event;
    ctx.session.botOnType = 1;
    yield ctx.answerCallbackQuery({
        text: event,
    });
    yield ctx.reply('Enter Your Wish:', {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.EventReply = EventReply;
const FinalReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const wish = ctx.message.text;
    ctx.session.wish = wish;
    if (wish == null) {
        (0, exports.FinalReply)(ctx);
    }
    const eventName = ctx.session.eventName;
    const name = ctx.message.from.username;
    const collection = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).findOneBy({
        eventName: eventName,
        teleUser: name,
    });
    if (!collection) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).save({
            eventName: eventName,
            teleUser: name,
            wishText: wish,
        });
        yield ctx.reply(`Wish Received for ${eventName}`);
    }
    else {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).updateOne({ teleUser: name, eventName: eventName }, { $set: { wishText: wish } });
        yield ctx.reply(`Wish Overriden for ${eventName}`);
    }
    ctx.session = (0, _SessionData_1.initial)();
    // }
});
exports.FinalReply = FinalReply;
