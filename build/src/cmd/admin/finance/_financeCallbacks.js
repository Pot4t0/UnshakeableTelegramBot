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
const adminFinance = (bot) => {
    //Finance Team Management
    _index_1.team.teamManagement(bot, 'Finance');
    //Fund Management
    bot.callbackQuery('fundManagement', _telefunctions_1.loadFunction, fundMenu);
    bot.callbackQuery('addOffering', addOffering);
    bot.callbackQuery(/^addOffering-/, addOfferingAmount);
    bot.callbackQuery('rmOffering', deleteOffering);
    //Reimbursement Management
    bot.callbackQuery('reimbursementManagement', _telefunctions_1.loadFunction, reimbursementMenu);
    bot.callbackQuery('approveReimbursement', approveReimbursement);
    bot.callbackQuery(/^approveReimbursement-/, approveReimbursementFunction);
    bot.callbackQuery('rejectReimbursement', rejectReimbursement);
    bot.callbackQuery(/^rejectReimbursement-/, rejectReimbursementFunction);
    bot.callbackQuery('completedReimbursement', completedReimbursement);
    bot.callbackQuery(/^completedReimbursement-/, completedReimbursementWitness);
    bot.callbackQuery(/^completedReimbursementWitness-/, completedReimbursementAmount);
    bot.callbackQuery(/^completedReimbursementAmount-/, completedReimbursementFunction);
    //Change Finance Password
    bot.callbackQuery('changeFinancePassword', changeFinancePassword);
    bot.callbackQuery(/^changePassword/, cfmPassword);
    //Change Finance Chat
    _index_1.chat.chooseChat(bot, 'Finance');
};
exports.adminFinance = adminFinance;
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
const addOfferingAmount = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('addOffering-'.length);
    ctx.session.name = callback;
    await ctx.reply('Please input offering amount ($SGD):', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 13;
};
const deleteOffering = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Please input Transaction Id:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 15;
};
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
    ]);
    await ctx.reply(`<b>All Statuses:</b>\nPending Approval 🟠\nPending Reimbursement 🟠\nCompleted ✅\n\nTo Be Reimbursed Amount: $${reimburse}\n\nTotal Claims: ${totalClaims}\nAwaiting Approval: ${awaitingApprovedClaims}\nAwaiitng Reimbursement: ${awaitingReimbursementClaims}\nCompleted: ${completedClaims}`, {
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
    });
};
const approveReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Approval 🟠',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description,
            callback_data: `approveReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to approve:', {
        reply_markup: inlineKeyboard,
    });
};
const approveReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = parseInt(ctx.update.callback_query.data.substring('approveReimbursement-'.length));
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    const user = claim.name;
    const amount = claim.amount;
    const reason = claim.description;
    const claimid = claim.claimid;
    const status = 'Pending Reimbursement 🟠';
    const formattedDate = claim.date;
    claim.status = 'Pending Reimbursement 🟠';
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).save(claim);
    await ctx.api.editMessageCaption(process.env.LG_FINANCE_CLAIM || '', callback, {
        caption: `Claim submitted by\n${user}\n${formattedDate}\nClaim ID: ${claimid}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`,
        parse_mode: 'HTML',
    });
    await ctx.reply('Claim Approved');
    ctx.session = (0, _SessionData_1.initial)();
};
const rejectReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Approval 🟠',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description,
            callback_data: `rejectReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to reject:', {
        reply_markup: inlineKeyboard,
    });
};
const rejectReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = parseInt(ctx.update.callback_query.data.substring('rejectReimbursement-'.length));
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
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
    const teleUser = user.teleUser;
    const desc = claim.description;
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).deleteOne({
        claimid: callback,
    });
    await ctx.api.deleteMessage(process.env.LG_FINANCE_CLAIM || '', callback);
    await _index_1.dbMessaging.sendMessageUser(teleUser, `Your claim (${desc}) has been rejected. Please contact the finance personnel if you have any queries!`, ctx);
    await ctx.reply(`Claim ${desc} Rejected. User has been notified`);
    ctx.session = (0, _SessionData_1.initial)();
};
const completedReimbursement = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const claims = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).find({
        status: 'Pending Reimbursement 🟠',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(claims.map((n) => [
        {
            text: n.description,
            callback_data: `completedReimbursement-${n.claimid}`,
        },
    ]));
    await ctx.reply('Choose claim to complete:', {
        reply_markup: inlineKeyboard,
    });
};
const completedReimbursementWitness = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = parseInt(ctx.update.callback_query.data.substring('completedReimbursement-'.length));
    const claim = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).findOneBy({
        claimid: callback,
    });
    if (!claim) {
        await ctx.reply('Invalid Claim');
        return;
    }
    ctx.session.chatId = callback;
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
const completedReimbursementAmount = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('completedReimbursementWitness-'.length);
    const claimid = ctx.session.chatId;
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
const completedReimbursementFunction = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('completedReimbursementAmount-'.length);
    const claimid = ctx.session.chatId;
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
            const uuid = (0, uuid_1.v4)();
            const dateTime = luxon_1.DateTime.now()
                .setZone('Asia/Singapore')
                .toFormat('dd/mm/yyyy hh:mm:ss');
            await reimbursementSheet.addRow({
                'Transaction ID': uuid,
                'Claim ID': claimid,
                Timestamp: dateTime,
                Date: claim.date,
                Amount: -claim.amount,
                Description: claim.description,
                'Approved by': userDoc.nameText,
                Witness: witness,
            });
            await allRecordSheet.addRow({
                'Transaction ID': uuid,
                'Claim ID': claimid,
                Timestamp: dateTime,
                Date: claim.date,
                Amount: -claim.amount,
                Description: claim.description,
                'Approved by': userDoc.nameText,
                Witness: witness,
            });
            await ctx.api.editMessageCaption(process.env.LG_FINANCE_CLAIM || '', claimid, {
                caption: `Claim submitted by\n${claim.name}\n${claim.date}\nClaim ID: ${claim.claimid}\n\n<b>Completed ✅</b>\n\nAmount: $${claim.amount}\nDescription: ${claim.description}`,
                parse_mode: 'HTML',
            });
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Claims).deleteOne({
                claimid: claimid,
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
const changeFinancePassword = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Please input current password:', {});
    ctx.session.botOnType = 17;
};
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
const changeFinanceChat = async (ctx) => { };
