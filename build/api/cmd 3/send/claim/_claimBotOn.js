"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitClaim = exports.logClaimReason = exports.logClaimAmount = void 0;
const _SessionData_1 = require("../../../models/_SessionData");
const luxon_1 = require("luxon");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const crypto_1 = require("crypto");
const _initialise_1 = require("../../../functions/_initialise");
/**
 * Used for receiving claim amount
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 10 (logClaimAmountBotOn)
 * @param ctx The message context.
 */
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
/**
 * Used for receiving claim reason
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 11
 * @param ctx The message context.
 */
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
/**
 * Used for submitting claim
 * Used in _botOn_functions.ts
 * - Refer to case botOnPhoto = 1
 * @param ctx The message context with photo.
 */
const submitClaim = async (ctx) => {
    ctx.session.botOnPhoto = undefined;
    const photo = await ctx.getFile();
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
        const financeSheet = await (0, _initialise_1.gsheet)('finance');
        const claimsSheet = financeSheet.sheetsByTitle['Claims'];
        const financeTeam = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            role: 'finance',
        });
        if (claimChatId && user && amount && reason) {
            const claimId = (0, crypto_1.randomUUID)();
            const claimDoc = new _tableEntity_1.Claims();
            claimDoc.claimid = claimId;
            claimDoc.amount = parseInt(amount);
            claimDoc.name = user;
            claimDoc.status = status;
            claimDoc.description = reason;
            claimDoc.date = formattedDate;
            claimDoc.msg = claimMsg;
            const newRow = await claimsSheet.addRow({
                'Claim ID': claimId,
                Date: formattedDate,
                Amount: amount,
                Description: reason,
                Status: status,
                Claimee: user,
            });
            const photoFormula = `=IMAGE("https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${photo.file_path}")`; // Telegram API to get photo
            newRow.set('Images', photoFormula);
            await newRow.save();
            const sendDB = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).save(claimDoc);
            if (sendDB && newRow) {
                await ctx.reply('Claim submitted! Thank you!');
                // await Promise.all(
                //   financeTeam.map(async (i) => {
                //     await dbMessaging.sendMessageUser(
                //       i.teleUser,
                //       `${user} has submitted a claim.`,
                //       ctx
                //     );
                //   })
                // );
            }
            else {
                await ctx.reply('Error! Please try again!');
            }
        }
        else {
            await ctx.reply('Error! Please try again!');
        }
        financeSheet.resetLocalCache();
        ctx.session = (0, _SessionData_1.initial)();
    }
};
exports.submitClaim = submitClaim;
