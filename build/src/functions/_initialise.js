"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init_bot = void 0;
require("reflect-metadata");
require("dotenv/config");
const grammy_1 = require("grammy");
const _SessionData_1 = require("../models/_SessionData");
const conversations_1 = require("@grammyjs/conversations");
//Initilaise Telegram Bot
const init_bot = () => {
    const token = process.env.BOT_TOKEN || '';
    const bot = new grammy_1.Bot(token);
    if (!token)
        throw new Error('BOT_TOKEN is unset');
    bot.use((0, grammy_1.session)({ initial: _SessionData_1.initial }));
    bot.use((0, conversations_1.conversations)());
    return bot;
};
exports.init_bot = init_bot;
