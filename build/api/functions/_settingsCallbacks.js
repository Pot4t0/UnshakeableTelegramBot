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
exports.settingsAnnouncements_Output = exports.settingsAnnouncements_Input = void 0;
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_functions_1 = require("./_db_functions");
const _SessionData_1 = require("../models/_SessionData");
const settingsAnnouncements_Input = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.botOnType = 31;
    yield ctx.reply(`Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.settingsAnnouncements_Input = settingsAnnouncements_Input;
const settingsAnnouncements_Output = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const announcement = (yield ctx.message.text) || '';
    const allNames = _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
    const sendUsers = (yield allNames)
        .map((n) => n.teleUser)
        .filter((n) => n != '');
    yield Promise.all(sendUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, _db_functions_1.sendMessageUser)(n, announcement, ctx);
    })));
    yield ctx.reply(`Announcement sent!`);
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.settingsAnnouncements_Output = settingsAnnouncements_Output;
