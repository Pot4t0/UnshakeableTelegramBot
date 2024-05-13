"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminFinance = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../../app/_telefunctions");
const _index_1 = require("../../../database_mongoDB/functions/_index");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _initialise_1 = require("../../../functions/_initialise");
const _SessionData_1 = require("../../../models/_SessionData");
const uuid_1 = require("uuid");
const luxon_1 = require("luxon");
const _gsheet_functions_1 = require("../../../gsheets/_gsheet_functions");
/**
 * /adminFinance
 * - Sets up callback query handlers for the Finance command.
 * - This function registers callback queries for the Finance command.
 * @param bot The Bot instance.
 */
const adminFinance = (bot) => {
    //Finance Team Management
    _index_1.team.teamManagement(bot, 'Finance');
    //Fund Management
    bot.callbackQuery('fundManagement', _telefunctions_1.loadFunction, fundMenu);
    bot.callbackQuery('addOffering', _telefunctions_1.loadFunction, addOffering);
    bot.callbackQuery(/^addOffering-/, _telefunctions_1.loadFunction, addOfferingAmount);
    bot.callbackQuery('rmOffering', _telefunctions_1.loadFunction, deleteOffering);
    //Reimbursement Management
    bot.callbackQuery('reimbursementManagement', _telefunctions_1.loadFunction, reimbursementMenu);
    bot.callbackQuery('viewAllClaims', _telefunctions_1.loadFunction, viewAllClaims);
    bot.callbackQuery('approveReimbursement', _telefunctions_1.loadFunction, approveReimbursement);
    bot.callbackQuery(/^approveReimbursement-/, _telefunctions_1.loadFunction, approveReimbursementFunction);
    bot.callbackQuery('rejectReimbursement', _telefunctions_1.loadFunction, rejectReimbursement);
    bot.callbackQuery(/^rejectReimbursement-/, _telefunctions_1.loadFunction, rejectReimbursementFunction);
    bot.callbackQuery('completedReimbursement', _telefunctions_1.loadFunction, completedReimbursement);
    bot.callbackQuery(/^completedReimbursement-/, _telefunctions_1.loadFunction, completedReimbursementWitness);
    bot.callbackQuery(/^completedReimbursementWitness-/, completedReimbursementAmount);
    bot.callbackQuery(/^completedReimbursementAmount-/, completedReimbursementFunction);
    bot.callbackQuery('deleteReimbursements', _telefunctions_1.loadFunction, deleteReimbursements);
    bot.callbackQuery(/^deleteReimbursements-/, _telefunctions_1.loadFunction, deleteReimbursementFunction);
    //Change Finance Password
    bot.callbackQuery('changeFinancePassword', _telefunctions_1.loadFunction, changeFinancePassword);
    bot.callbackQuery(/^changePassword/, _telefunctions_1.loadFunction, cfmPassword);
    //Change Finance Chat
    _index_1.chat.chooseChat(bot, 'Finance');
};
exports.adminFinance = adminFinance;
/**
 * Fund Management Menu
 * - Sends a list of options for fund management.
 * @param ctx The message context.
 */
const fundMenu = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Add Offering',
                callback_data: 'addOffering',
            },
        ],
        [
            {
                text: 'Remove Offering',
                callback_data: 'rmOffering',
            },
        ],
    ]);
    await ctx.reply('Choose an option:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Logs Witness for Offering
 * @param ctx The message context.
 */
const addOffering = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const names = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(names.map((n) => [
        {
            text: n.nameText,
            callback_data: `addOffering-${n.nameText}`,
        },
    ]));
    await ctx.reply('Please select the witness:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Logs Offering Amount
 * @param ctx The message context.
 */
const addOfferingAmount = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('addOffering-'.length);
    ctx.session.name = callback;
    await ctx.reply('Please input offering amount ($SGD):', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 13;
};
/**
 * Deletes Offering
 * @param ctx The message context.
 */
const deleteOffering = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Please input Transaction Id:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 15;
};
/**
 * Reimbursement Management Menu
 * - Sends a list of options for reimbursement management.
 * @param ctx The message context.
 */
const reimbursementMenu = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find();
    const pendingApproval = claims.filter((n) => n.status === 'Pending Approval 🟠');
    const pendingReimbursment = claims.filter((n) => n.status === 'Pending Reimbursement 🟠');
    const financeSheet = await (0, _initialise_1.gsheet)('finance');
    const reimburseSheet = financeSheet.sheetsByTitle['Reimbursement'];
    await reimburseSheet.loadCells('K1:K1');
    const completedClaims = reimburseSheet.getCellByA1('K1').numberValue || 0;
    const reimburse = claims.map((n) => n.amount).reduce((a, b) => a + b, 0);
    const awaitingApprovedClaims = pendingApproval.length;
    const awaitingReimbursementClaims = pendingReimbursment.length;
    const totalClaims = claims.length + completedClaims;
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'View All Claims',
                callback_data: 'viewAllClaims',
            },
        ],
        [
            {
                text: 'Approve Reimbursement',
                callback_data: 'approveReimbursement',
            },
        ],
        [
            {
                text: 'Reject Reimbursement',
                callback_data: 'rejectReimbursement',
            },
        ],
        [
            {
                text: 'Completed Reimbursement',
                callback_data: 'completedReimbursement',
            },
        ],
        [
            {
                text: 'Delete Reimbursements',
                callback_data: 'deleteReimbursements',
            },
        ],
    ]);
    await ctx.reply(`<b>All Statuses:</b>\nPending Approval 🟠\nPending Reimbursement 🟠\nCompleted ✅\n\nTo Be Reimbursed Amount: $${reimburse}\n\nTotal Claims: ${totalClaims}\nAwaiting Approval: ${awaitingApprovedClaims}\nAwaiitng Reimbursement: ${awaitingReimbursementClaims}\nCompleted: ${completedClaims}`, {
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
    });
};
/**
 * View All Claims
 * - Sends all claims to the finance chat.
 * @param ctx The message context.
 */
const viewAllClaims = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const approvalClaims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Approval 🟠',
    });
    const reimbursementClaims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Reimbursement 🟠',
    });
    const claims = approvalClaims.concat(reimbursementClaims);
    if (claims.length === 0) {
        await ctx.reply('No claims to view');
        return;
    }
    claims.map(async (n) => {
        await ctx.reply(n.msg, { parse_mode: 'HTML' });
    });
};
/**
 * Approve Reimbursement
 * - Sends a list of claims to approve.
 * @param ctx The message context.
 */
const approveReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Approval 🟠',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
            callback_data: `approveReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to approve:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Approve Reimbursement Function
 * - Approves the selected claim.
 * @param ctx The message context.
 */
const approveReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('approveReimbursement-'.length);
    const financeGSheet = await (0, _initialise_1.gsheet)('finance');
    const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    const name = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
        teleUser: ctx.update.callback_query.from.username,
    });
    await claimsSheet.loadCells();
    const claimRowNo = await (0, _gsheet_functions_1.searchRowNo)(callback, claimsSheet, 'A', 2, claimsSheet.rowCount);
    const claimRows = await claimsSheet.getRows({});
    let row = null;
    if (!claim || !name) {
        await ctx.reply('Invalid Claim');
        return;
    }
    if (claimRowNo != -1 && claimRowNo) {
        row = claimRows[claimRowNo - 2];
    }
    else {
        await ctx.reply('Invalid Claim');
        return;
    }
    const user = claim.name;
    const amount = claim.amount;
    const reason = claim.description;
    const status = 'Pending Reimbursement 🟠';
    const formattedDate = claim.date;
    const claimMsg = `Claim submitted by\n${user}\n${formattedDate}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`;
    claim.status = status;
    claim.msg = claimMsg;
    const savedDBEntry = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).save(claim);
    if (!savedDBEntry) {
        await ctx.reply('Invalid Claim');
        return;
    }
    if (row) {
        row.set('Status', status);
        row.set('Approved by', name.nameText);
        row.save();
    }
    else {
        await ctx.reply('Invalid Claim');
        return;
    }
    await ctx.reply('Claim Approved');
    ctx.session = (0, _SessionData_1.initial)();
};
/**
 * Reject Reimbursement
 * - Sends a list of claims to reject.
 * @param ctx The message context.
 */
const rejectReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const approvedClaims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Approval 🟠',
    });
    const reimbursementClaims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Reimbursement 🟠',
    });
    const claims = approvedClaims.concat(reimbursementClaims);
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
            callback_data: `rejectReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to reject:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Reject Reimbursement Function
 * - Rejects the selected claim.
 * @param ctx The message context.
 */
const rejectReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('rejectReimbursement-'.length);
    const financeGSheet = await (0, _initialise_1.gsheet)('finance');
    const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
    await claimsSheet.loadCells();
    const claimRowNo = await (0, _gsheet_functions_1.searchRowNo)(callback, claimsSheet, 'A', 2, claimsSheet.rowCount);
    const claimRows = await claimsSheet.getRows({});
    let row = null;
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    if (claimRowNo != -1 && claimRowNo) {
        row = claimRows[claimRowNo - 2];
    }
    else {
        await ctx.reply('Invalid Claim');
        return;
    }
    const user = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
        nameText: claim.name,
    });
    if (!user) {
        await ctx.reply('Invalid User');
        return;
    }
    if (!row) {
        await ctx.reply('Invalid Claim');
        return;
    }
    const teleUser = user.teleUser;
    const desc = claim.description;
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).deleteOne({
        claimid: callback,
    });
    await row.delete();
    await _index_1.dbMessaging.sendMessageUser(teleUser, `Your claim (${desc}) has been rejected. Please contact the finance personnel if you have any queries!`, ctx);
    await ctx.reply(`Claim ${desc} Rejected. User has been notified`);
    ctx.session = (0, _SessionData_1.initial)();
};
/**
 * Completed Reimbursement
 * - Sends a list of claims to complete.
 * @param ctx The message context.
 */
const completedReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Reimbursement 🟠',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
            callback_data: `completedReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to complete:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Completed Reimbursement Witness
 * - Sends a list of witnesses to complete the claim.
 * @param ctx The message context.
 */
const completedReimbursementWitness = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('completedReimbursement-'.length);
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    ctx.session.claimId = callback;
    const names = await _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(names.map((n) => [
        {
            text: n.nameText,
            callback_data: `completedReimbursementWitness-${n.teleUser}`,
        },
    ]));
    await ctx.reply('Choose witness:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Completed Reimbursement Amount
 * - Completes the claim with the exact amount.
 * @param ctx The message context.
 */
const completedReimbursementAmount = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('completedReimbursementWitness-'.length);
    const claimid = ctx.session.claimId;
    const witness = await _db_init_1.Database.getRepository(_tableEntity_1.Names).findOneBy({
        teleUser: callback,
    });
    if (!witness) {
        await ctx.reply('Invalid Witness');
        return;
    }
    ctx.session.reminderUser = witness.nameText;
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: claimid,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    await ctx.reply(`This is the claim amount ${claim.amount}. Did you reimburse this EXACT amount?`, {
        reply_markup: new grammy_1.InlineKeyboard([
            [
                {
                    text: 'Yes',
                    callback_data: `completedReimbursementAmount-Yes`,
                },
            ],
            [
                {
                    text: 'No',
                    callback_data: `completedReimbursementAmount-No`,
                },
            ],
        ]),
    });
};
/**
 * Completed Reimbursement Function
 * - Completes the claim with the exact amount.
 * @param ctx The message context.
 */
const completedReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('completedReimbursementAmount-'.length);
    const claimid = ctx.session.claimId;
    const witness = ctx.session.reminderUser;
    const user = ctx.callbackQuery.from.username;
    if (claimid && user && witness) {
        const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
            claimid: claimid,
        });
        const userDoc = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).findOneBy({
            teleUser: user,
        });
        if (!claim || !userDoc) {
            await ctx.reply('Invalid Claim');
            return;
        }
        if (callback === 'Yes') {
            const financeGSheet = await (0, _initialise_1.gsheet)('finance');
            const reimbursementSheet = financeGSheet.sheetsByTitle['Reimbursement'];
            const allRecordSheet = financeGSheet.sheetsByTitle['All Records'];
            const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
            await claimsSheet.loadCells();
            const claimRowNo = await (0, _gsheet_functions_1.searchRowNo)(claimid, claimsSheet, 'A', 2, claimsSheet.rowCount);
            const claimRows = await claimsSheet.getRows({});
            let row = null;
            if (claimRowNo != -1) {
                row = claimRows[claimRowNo - 2];
            }
            else {
                await ctx.reply('Invalid Claim!');
                return;
            }
            const uuid = (0, uuid_1.v4)();
            const dateTime = luxon_1.DateTime.now()
                .setZone('Asia/Singapore')
                .toFormat('dd/mm/yyyy hh:mm:ss');
            const claimMsg = `Claim submitted by\n${claim.name}\n${claim.date}\nClaim ID: ${claim.claimid}\n\n<b>Completed ✅</b>\n\nAmount: $${claim.amount}\nDescription: ${claim.description}`;
            claim.msg = claimMsg;
            claim.status = 'Completed ✅';
            const savedDBEntry = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).save(claim);
            if (!savedDBEntry) {
                await ctx.reply('Something went wrong! Pls try again!');
                return;
            }
            if (row) {
                row.set('Status', 'Completed ✅');
                row.save();
            }
            else {
                await ctx.reply('Something went wrong! Pls try again!');
                return;
            }
            await reimbursementSheet.addRow({
                'Transaction ID': uuid,
                'Claim ID': claimid,
                Timestamp: dateTime,
                Date: claim.date,
                Amount: -claim.amount,
                Description: claim.description,
                'Approved by': userDoc.nameText,
                Claimee: claim.name,
                Witness: witness,
            });
            await allRecordSheet.addRow({
                'Transaction ID': uuid,
                'Claim ID': claimid,
                Timestamp: dateTime,
                Date: claim.date,
                Type: 'Reimbursement',
                Amount: -claim.amount,
                Description: claim.description,
                'Approved by': userDoc.nameText,
                'Claimed by': claim.name,
                Witness: witness,
            });
            await ctx.reply('Claim Completed');
            financeGSheet.resetLocalCache();
            ctx.session = (0, _SessionData_1.initial)();
        }
        else {
            await ctx.reply('Please input the amount reimbursed ($SGD):', {
                reply_markup: { force_reply: true },
            });
            ctx.session.botOnType = 16;
        }
    }
};
/**
 * Delete Reimbursements
 * - Sends a list of claims to delete.
 * @param ctx The message context.
 */
const deleteReimbursements = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Completed ✅',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
            callback_data: `deleteReimbursements-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to delete:', {
        reply_markup: inlineKeyboard,
    });
};
/**
 * Delete Reimbursement Function
 * - Deletes the selected claim.
 * @param ctx The message context.
 */
const deleteReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('deleteReimbursements-'.length);
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    const financeGSheet = await (0, _initialise_1.gsheet)('finance');
    const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
    const allRecordSheet = financeGSheet.sheetsByTitle['All Records'];
    const reimbursementSheet = financeGSheet.sheetsByTitle['Reimbursement'];
    await claimsSheet.loadCells();
    await allRecordSheet.loadCells();
    await reimbursementSheet.loadCells();
    const claimRowNo = await (0, _gsheet_functions_1.searchRowNo)(callback, claimsSheet, 'A', 2, claimsSheet.rowCount);
    const allRecordRowNo = await (0, _gsheet_functions_1.searchRowNo)(callback, allRecordSheet, 'B', 2, allRecordSheet.rowCount);
    const reimbursementRowNo = await (0, _gsheet_functions_1.searchRowNo)(callback, reimbursementSheet, 'B', 2, reimbursementSheet.rowCount);
    const claimRows = await claimsSheet.getRows({});
    const allRecordRows = await allRecordSheet.getRows({});
    const reimbursementRows = await reimbursementSheet.getRows({});
    let claimRow = null;
    let allRecordRow = null;
    let reimbursementRow = null;
    if (claimRowNo != -1 &&
        claimRowNo &&
        allRecordRowNo != -1 &&
        allRecordRowNo &&
        reimbursementRowNo != -1 &&
        reimbursementRowNo) {
        claimRow = claimRows[claimRowNo - 2];
        allRecordRow = allRecordRows[allRecordRowNo - 2];
        reimbursementRow = reimbursementRows[reimbursementRowNo - 2];
    }
    else {
        await ctx.reply('Invalid Claim');
        return;
    }
    if (claimRow && allRecordRow && reimbursementRow) {
        await claimRow.delete();
        await allRecordRow.delete();
        await reimbursementRow.delete();
    }
    else {
        await ctx.reply('Invalid Claim');
        return;
    }
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).deleteOne({
        claimid: callback,
    });
    await ctx.reply('Claim Deleted');
};
/**
 * Change Finance Password
 * - Changes the finance password.
 * @param ctx The message context.
 */
const changeFinancePassword = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Please input current password:', {});
    ctx.session.botOnType = 17;
};
/**
 * Confirm Password
 * - Confirms the password change.
 * @param ctx The message context.
 */
const cfmPassword = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('changePassword'.length);
    if (callback === 'Yes') {
        const password = ctx.session.text;
        const config = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'LG',
        });
        if (!config) {
            await ctx.reply('Invalid Password');
            return;
        }
        config.config[2] = password;
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).save(config);
        process.env.FINANCE_PASSWORD = password;
        ctx.session = (0, _SessionData_1.initial)();
        await ctx.reply('Password changed! Please delete chat history for security!');
        ctx.session = (0, _SessionData_1.initial)();
    }
    else {
        await ctx.reply('Password not changed, Please enter another new password');
        ctx.session.botOnType = 18;
    }
};
/**
 * Change Finance Chat
 * - Changes the finance chat.
 * @param ctx The message context.
 */
const changeFinanceChat = async (ctx) => { };
