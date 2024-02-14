"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageUser = void 0;
const _tableEntity_1 = require("../Entity/_tableEntity");
const _db_init_1 = require("../_db-init");
//Send to User in their respective ChatId with telegram bot
const sendMessageUser = async (user, msg, ctx) => {
    const name = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
        teleUser: user,
    });
    if (name) {
        const message = await ctx.api.sendMessage(name.chat, msg, {
            parse_mode: 'HTML',
        });
        return message;
    }
    else {
        await ctx.reply(`Error in sending message to ${user}!`);
        console.log(`Error in sending message to ${user}!`);
    }
};
exports.sendMessageUser = sendMessageUser;
