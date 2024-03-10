"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClaim = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../../app/_telefunctions");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _claimInternal_1 = require("./_claimInternal");
const sendClaim = (bot) => {
    // Send Claim Callbacks
    bot.callbackQuery('makeClaim', makeClaim);
    bot.callbackQuery(/^makeClaim-/, makeClaimYesNo);
    bot.callbackQuery(/^makeClaimName-/, makeClaimYes);
    bot.callbackQuery('viewClaim', viewClaim);
};
exports.sendClaim = sendClaim;
const makeClaim = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Yes',
                callback_data: 'makeClaim-yes',
            },
        ],
        [
            {
                text: 'No',
                callback_data: 'makeClaim-no',
            },
        ],
    ]);
    await ctx.reply(`Are you making a claim on behalf of someone else?`, {
        reply_markup: inlineKeyboard,
    });
};
const makeClaimYesNo = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const user = ctx.callbackQuery.from.username;
    const callback = ctx.update.callback_query.data.substring('makeClaim-'.length);
    if (callback === 'yes') {
        const names = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
        const inlineKeyboard = new grammy_1.InlineKeyboard(names.map((n) => [
            {
                text: n.nameText,
                callback_data: `makeClaimName-${n.teleUser}`,
            },
        ]));
        await ctx.reply('Please input the name of the person you are making the claim for:', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
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
    }
};
const makeClaimYes = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('makeClaimName-'.length);
    const name = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: callback,
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
            await ctx.api.forwardMessage(userChatid, financeChatid, n.claimid);
            console.log('Claim Message ID: ' + n.claimid);
        }));
    }
    else {
        await ctx.reply('Error in system please try again later.');
    }
};
