"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitClaim = exports.logClaimReason = exports.logClaimAmount = void 0;
const _SessionData_1 = require("../../../models/_SessionData");
const luxon_1 = require("luxon");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
// /sendclaim BotOn Functions
//Used for receiving claim amount
//Refer to logClaimAmount Method in _claimInternal.ts
const logClaimAmount = async (ctx) => {
    ctx.session.botOnType = undefined;
    const amount = ctx.message.text;
    if (amount == null) {
        (0, exports.logClaimAmount)(ctx);
    }
    else {
        // Log Claim Amount
        ctx.session.amount = amount;
        ctx.session.botOnType = 11;
        await ctx.reply('Please input the description for the claim:');
    }
};
exports.logClaimAmount = logClaimAmount;
//Used for receiving claim reason
//Refer to botOnHandler in _botOn_functions.ts
//BotOntype = 11
const logClaimReason = async (ctx) => {
    ctx.session.botOnType = undefined;
    const reason = ctx.message.text;
    if (reason == null) {
        (0, exports.logClaimReason)(ctx);
    }
    else {
        // Log Claim Reason
        ctx.session.text = reason;
        await ctx.reply('Please send in the image of the receipt for the claim.\n\n<b>(PHOTOS ONLY NO NEED TEXT)</b>', { parse_mode: 'HTML' });
        ctx.session.botOnPhoto = 1;
    }
};
exports.logClaimReason = logClaimReason;
//Used for submitting claim
//Refer to BotOnHandler in _botOn_functions.ts
//BotOnPhoto = 1
const submitClaim = async (ctx) => {
    ctx.session.botOnPhoto = undefined;
    const photo = ctx.update.message.photo;
    if (photo == null) {
        (0, exports.submitClaim)(ctx);
    }
    else {
        // Log Claim Receipt
        const user = ctx.session.name;
        const amount = ctx.session.amount;
        const reason = ctx.session.text;
        const date = luxon_1.DateTime.now().setZone('Asia/Singapore');
        const claimChatId = process.env.LG_FINANCE_CLAIM;
        const status = 'Pending Approval 🟠';
        const formattedDate = `${date.day} ${date.monthShort} ${date.year}`;
        const claimMsg = `Claim submitted by\n${user}\n${formattedDate}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`;
        if (claimChatId && user && amount && reason) {
            const claim = await ctx.api.sendPhoto(claimChatId, photo[photo.length - 1].file_id, {
                caption: claimMsg,
                parse_mode: 'HTML',
            });
            if (claim) {
                const claimId = claim.message_id;
                const claimDoc = new _tableEntity_1.Claims();
                claimDoc.claimid = claimId;
                claimDoc.amount = parseInt(amount);
                claimDoc.name = user;
                claimDoc.status = status;
                claimDoc.description = reason;
                claimDoc.date = formattedDate;
                const sendDB = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).save(claimDoc);
                if (sendDB) {
                    await ctx.reply('Claim submitted! Thank you!');
                }
                else {
                    await ctx.reply('Error! Please try again!');
                    ctx.api.deleteMessage(claimChatId, claimId);
                }
            }
            else {
                await ctx.reply('Error! Please try again!');
            }
        }
        else {
            await ctx.reply('Error! Please try again!');
        }
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.submitClaim = submitClaim;
