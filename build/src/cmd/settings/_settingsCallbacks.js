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
exports.settings = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
// Settings Callbacks
// Any overall bot admin settings
const settings = (bot) => {
    bot.callbackQuery('settingsAnnouncements', settingsAnnouncements_Write); //Settings Announcements Input
    bot.callbackQuery('settingsNewUser', newUserManagement); //Settings New User Management
    bot.callbackQuery('settingsLGGroup', lgGroupManagement); //Settings Bot On
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
const newUserManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard().requestUser('Add User', 1).oneTime(true);
    yield ctx.reply('Click button to go to contact list', {
        reply_markup: button,
    });
});
const lgGroupManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard().requestChat('Choose LG Chat', 1).oneTime(true);
    yield ctx.reply(`Choose the updated LG Chat. It will let the Bot enter the chat and send messages.
    `, {
        reply_markup: button,
    });
});
