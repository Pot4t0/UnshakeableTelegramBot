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
const grammy_1 = require("grammy");
const query_1 = require("./database/query");
const token = '6311860288:AAExnXXlX0a7ZYBs40YUqUdPzRSWgX4sVzc';
const bot = new grammy_1.Bot(token); // <-- put your bot token between the ""
function initial() {
    return {
        eventName: undefined,
        name: undefined,
        wish: undefined
    };
}
bot.use((0, grammy_1.session)({ initial }));
// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.
// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("UNSHAKEABLE WELFARE! :D"));
// Handle other messages.
bot.command("sendwish", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield query_1.query.select("eventTable", "name");
    const inlineKeyboard = new grammy_1.InlineKeyboard(events.map(event => [{
            text: event,
            callback_data: `eventName-${event}`
        }]));
    yield ctx.reply("Current upcoming event: ", {
        reply_markup: inlineKeyboard
    });
}));
bot.callbackQuery(/^eventName-/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = ctx.update.callback_query.data.substring('eventName-'.length);
    ctx.session.eventName = event;
    const names = yield query_1.query.select("nameTable", "text");
    const inlineKeyboard = new grammy_1.InlineKeyboard(names.map(n => [{
            text: n,
            callback_data: `name-${n}`
        }]));
    yield ctx.answerCallbackQuery({
        text: event,
    });
    yield ctx.reply("Name: ", {
        reply_markup: inlineKeyboard
    });
}));
bot.callbackQuery(/^name-/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const name = ctx.update.callback_query.data.substring('name-'.length);
    ctx.session.name = name;
    yield ctx.answerCallbackQuery({
        text: name,
    });
    yield ctx.reply("Wish: ", {
        reply_markup: {
            force_reply: true
        }
    });
}));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.eventName && ctx.session.name) {
        try {
            const wish = ctx.message.text || '';
            ctx.session.wish = wish;
            const eventName = ctx.session.eventName;
            const name = ctx.session.name;
            const wishSent = yield query_1.query.insert("wishTable", ['eventName', 'name', 'wish'], [eventName, name, wish]);
            ctx.reply("Wish Received");
            ctx.session = initial();
        }
        catch (err) {
            console.log(err);
        }
    }
}));
// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.
// Start the bot.
bot.start();
