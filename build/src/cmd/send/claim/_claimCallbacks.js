"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClaim = void 0;
const _telefunctions_1 = require("../../../app/_telefunctions");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _claimInternal_1 = require("./_claimInternal");
/**
 * Sets up callback query handlers for the claim command.
 * This function registers callback queries for the claim command.
 * - Make Claim
 * - View Claim
 * @param bot The Bot instance.
 */
const sendClaim = (bot) => {
    // Send Claim Callbacks
    bot.callbackQuery('makeClaim', makeClaim);
    bot.callbackQuery('viewClaim', viewClaim);
};
exports.sendClaim = sendClaim;
/**
 * Used for making a claim.
 * @param ctx The message context.
 */
const makeClaim = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const user = ctx.callbackQuery.from.username;
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: user,
    });
    if (!name) {
        await ctx.reply('Invalid Name');
        return;
    }
    ctx.session.name = name.nameText;
    await ctx.reply('Please input the amount you are claiming in (SGD$):', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = _claimInternal_1.logClaimAmountBotOn;
};
/**
 * Used for viewing claims.
 * @param ctx The message context.
 */
const viewClaim = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const teleUser = ctx.callbackQuery.from.username;
    const financeChatid = process.env.LG_FINANCE_CLAIM;
    const userChatid = ctx.callbackQuery.from.id;
    const names = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: teleUser,
    });
    if (!names) {
        await ctx.reply('Invalid Name');
        return;
    }
    const claims = await _db_init_1.Database.getRepository(_tableEntity_1.Claims).find({
        where: {
            name: names.nameText,
        },
    });
    if (claims.length === 0) {
        await ctx.reply('You have no claims');
        return;
    }
    if (financeChatid) {
        await Promise.all(claims.map(async (n) => {
            await ctx.reply(n.msg, { parse_mode: 'HTML' });
            console.log('Claim Message ID: ' + n.claimid);
        }));
    }
    else {
        await ctx.reply('Error in system please try again later.');
    }
};
