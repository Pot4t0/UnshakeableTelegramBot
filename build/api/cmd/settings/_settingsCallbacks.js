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
exports.settingsAnnouncements_Send = exports.settings = void 0;
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _index_1 = require("../../database_mongoDB/functions/_index");
const _telefunctions_1 = require("../../app/_telefunctions");
// Settings Callbacks
// Any overall bot admin settings
const settings = (bot) => {
    bot.callbackQuery('settingsAnnouncements', settingsAnnouncements_Write); //Settings Announcements Input
    //Settings Announcements Output is located in BotOnFunctions
};
exports.settings = settings;
// Settings Announcements Input
const settingsAnnouncements_Write = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield ctx.reply(`Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 31;
});
// Settings Announcements Output
// Used in _botOn_functions.ts
// Refer to case botOntype = 31
const settingsAnnouncements_Send = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const announcement = '<b>Bot Announcement:</b>\n' + ctx.message.text;
    if (announcement == null || ctx.session.botOnType == null) {
        (0, exports.settingsAnnouncements_Send)(ctx);
    }
    else {
        const allNames = _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
        const sendUsers = (yield allNames)
            .map((n) => n.teleUser)
            .filter((n) => n != '');
        yield Promise.all(sendUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const sentMsg = yield _index_1.dbMessaging.sendMessageUser(n, announcement, ctx);
            try {
                yield ctx.api.pinChatMessage(sentMsg.chat.id, sentMsg.message_id);
            }
            catch (err) {
                console.log(err);
            }
            console.log(announcement + `(${n})`);
        })));
        yield ctx.reply(`Announcement sent!`);
        ctx.session = (0, _SessionData_1.initial)();
    }
});
exports.settingsAnnouncements_Send = settingsAnnouncements_Send;
const newUserManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () { });
