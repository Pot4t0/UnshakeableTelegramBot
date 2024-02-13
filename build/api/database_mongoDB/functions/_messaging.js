"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageUser = void 0;
const _tableEntity_1 = require("../Entity/_tableEntity");
const _db_init_1 = require("../_db-init");
//Send to User in their respective ChatId with telegram bot
const sendMessageUser = async (user, msg, ctx) => {
    const name = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: user,
    });
    const message = await ctx.api.sendMessage(name[0].chat, msg, {
        parse_mode: 'HTML',
    });
    return message;
};
exports.sendMessageUser = sendMessageUser;
