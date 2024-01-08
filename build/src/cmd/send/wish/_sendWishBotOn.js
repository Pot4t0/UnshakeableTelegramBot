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
exports.sendWish_Execution = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _SessionData_1 = require("../../../models/_SessionData");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
//Used in _botOn_functions.ts in botOntype = 1
const sendWish_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const wish = ctx.message.text;
    ctx.session.wish = wish;
    if (wish == null) {
        (0, exports.sendWish_Execution)(ctx);
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
exports.sendWish_Execution = sendWish_Execution;
