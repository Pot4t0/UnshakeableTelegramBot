"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWish_Execution = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _SessionData_1 = require("../../../models/_SessionData");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
//Used in _botOn_functions.ts in botOntype = 1
/**
 * Used for sending a wish.
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 1
 * @param ctx The message context.
 * @throws Error if the wish could not be sent.
 */
const sendWish_Execution = async (ctx) => {
    const wish = ctx.message.text;
    ctx.session.wish = wish;
    try {
        if (wish == null) {
            (0, exports.sendWish_Execution)(ctx);
        }
        const eventName = ctx.session.eventName;
        const name = ctx.message.from.username;
        if (eventName || name) {
            const collection = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).findOneBy({
                eventName: eventName,
                teleUser: name,
            });
            if (!collection) {
                await _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).save({
                    eventName: eventName,
                    teleUser: name,
                    wishText: wish,
                });
                await ctx.reply(`Wish Received for ${eventName}`);
            }
            else {
                await _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).updateOne({ teleUser: name, eventName: eventName }, { $set: { wishText: wish } });
                await ctx.reply(`Wish Overriden for ${eventName}`);
            }
        }
        else {
            await ctx.reply(`Wish Send Failed! Please try again!`);
        }
    }
    catch (err) {
        await ctx.reply(`Wish Send Failed! Please try again!`);
        console.log(err);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.sendWish_Execution = sendWish_Execution;
