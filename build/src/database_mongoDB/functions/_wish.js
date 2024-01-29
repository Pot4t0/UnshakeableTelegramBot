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
exports.wishView = void 0;
const grammy_1 = require("grammy");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _db_init_1 = require("../_db-init");
const _telefunctions_1 = require("../../app/_telefunctions");
// Wish View System
// Wish Database - Contains all wishes
// Filtered through event name
// Events Databse - Contains all events
// Filtered events through team type (Welfare / Birthday)
// CallbackQuery: see{team}Wish-{eventName}
const wishView = (bot, team) => __awaiter(void 0, void 0, void 0, function* () {
    let eventName;
    bot.callbackQuery(`${team}WishView`, _telefunctions_1.loadFunction, (ctx) => {
        wishView_EventMenu(ctx, team);
    });
    bot.callbackQuery(/^seeWish-/g, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        eventName = ctx.update.callback_query.data.substring('seeWish-'.length);
        yield wishView_SendWishes(ctx, eventName);
    }));
});
exports.wishView = wishView;
const wishView_EventMenu = (ctx, team) => __awaiter(void 0, void 0, void 0, function* () {
    let eventTeam;
    if (team == 'Welfare') {
        eventTeam = 'Welfare';
    }
    else {
        eventTeam = 'Bday';
    }
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const eventObject = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: `${eventTeam}`,
    });
    const wishNumber = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes);
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).count();
    const inlineKeyboard = new grammy_1.InlineKeyboard(yield Promise.all(eventObject.map((e) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            {
                text: `${e.eventName}  ( ${(yield wishNumber.find({ eventName: e.eventName })).length} / ${totalNames} )`,
                callback_data: `seeWish-${e.eventName}`,
            },
        ];
    }))));
    yield ctx.reply(`
      Select ${team} Event
      `, {
        reply_markup: inlineKeyboard,
    });
});
const wishView_SendWishes = (ctx, eventName) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const wishArray = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
        eventName: eventName,
    });
    yield Promise.all(wishArray.map((n) => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.reply(`@${n.teleUser}\nWish: \n${n.wishText}`);
    })));
    if (wishArray[0] == null) {
        yield ctx.reply('No Wish Received 😢');
    }
});
