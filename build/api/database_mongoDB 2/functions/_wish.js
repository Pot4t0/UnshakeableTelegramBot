"use strict";
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
/**
 * Sets up callback query handlers for viewing wishes associated with a specific event.
 * This function registers callback queries for viewing wishes associated with either the Welfare or Birthday team.
 * @param bot The Bot instance.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const wishView = async (bot, team) => {
    let eventName;
    bot.callbackQuery(`${team}WishView`, _telefunctions_1.loadFunction, async (ctx) => {
        await wishView_EventMenu(ctx, team);
    });
    bot.callbackQuery(/^seeWish-/g, _telefunctions_1.loadFunction, async (ctx) => {
        eventName = ctx.update.callback_query.data.substring('seeWish-'.length);
        await wishView_SendWishes(ctx, eventName);
    });
};
exports.wishView = wishView;
/**
 * Handles the logic for viewing the event menu associated with a specific team.
 * This function displays a list of events when a user clicks on a callback button.
 * @param ctx The callback query context.
 * @param team The team parameter, which can be either 'Welfare' or 'Birthday'.
 */
const wishView_EventMenu = async (ctx, team) => {
    let eventTeam;
    if (team == 'Welfare') {
        eventTeam = 'Welfare';
    }
    else {
        eventTeam = 'Bday';
    }
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const eventObject = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Events).find({
        eventTeam: `${eventTeam}`,
    });
    const wishNumber = _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes);
    const totalNames = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).count();
    const currentUser = ctx.callbackQuery.from.username;
    const currentUserName = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: currentUser,
    });
    if (currentUserName == null) {
        await ctx.reply('You are not registered');
        return;
    }
    eventObject.map(async (e) => {
        if (e.notAllowedUser.includes(currentUserName.nameText)) {
            eventObject.splice(eventObject.indexOf(e), 1);
        }
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(await Promise.all(eventObject.map(async (e) => [
        {
            text: `${e.eventName}  ( ${(await wishNumber.find({ eventName: e.eventName })).length} / ${totalNames} )`,
            callback_data: `seeWish-${e.eventName}`,
        },
    ])));
    await ctx.reply(`
      Select ${team} Event
      `, {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Handles the logic for sending wishes associated with a specific event.
 * This function displays a list of wishes when a user clicks on a callback button.
 * @param ctx The callback query context.
 * @param eventName The name of the event.
 */
const wishView_SendWishes = async (ctx, eventName) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const wishArray = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Wishes).find({
        eventName: eventName,
    });
    await Promise.all(wishArray.map(async (n) => {
        await ctx.reply(`@${n.teleUser}\nWish: \n${n.wishText}`);
    }));
    if (wishArray[0] == null) {
        await ctx.reply('No Wish Received 😢');
    }
};
