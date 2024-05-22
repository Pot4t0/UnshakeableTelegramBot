"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageUser = void 0;
const _tableEntity_1 = require("../Entity/_tableEntity");
const _db_init_1 = require("../_db-init");
/**
 * Send message to user
 * @param user The user to send the message to.
 * @param msg The message to send.
 * @param ctx The context object.
 * @returns The message sent.
 */
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
