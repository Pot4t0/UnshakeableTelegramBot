import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { loadFunction, removeInLineButton } from '../../../app/_telefunctions';
import {
  chat,
  dbMessaging,
  team,
} from '../../../database_mongoDB/functions/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import {
  Claims,
  Names,
  Settings,
} from '../../../database_mongoDB/Entity/_tableEntity';
import { gsheet } from '../../../functions/_initialise';
import { initial } from '../../../models/_SessionData';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { searchRowNo } from '../../../gsheets/_gsheet_functions';
import { GoogleSpreadsheetRow } from 'google-spreadsheet';

/**
 * /adminFinance
 * - Sets up callback query handlers for the Finance command.
 * - This function registers callback queries for the Finance command.
 * @param bot The Bot instance.
 */
export const adminFinance = (bot: Bot<BotContext>) => {
  //Finance Team Management
  team.teamManagement(bot, 'Finance');

  //Fund Management
  bot.callbackQuery('fundManagement', loadFunction, fundMenu);
  bot.callbackQuery('addFunds', loadFunction, addFunds);
  bot.callbackQuery(/^addFunds-/, loadFunction, addFundsAmount);
  bot.callbackQuery('rmFunds', loadFunction, deleteFunds);

  //Reimbursement Management
  bot.callbackQuery('reimbursementManagement', loadFunction, reimbursementMenu);
  bot.callbackQuery('viewAllClaims', loadFunction, viewAllClaims);
  bot.callbackQuery('approveReimbursement', loadFunction, approveReimbursement);
  bot.callbackQuery(
    /^approveReimbursement-/,
    loadFunction,
    approveReimbursementFunction
  );
  bot.callbackQuery('rejectReimbursement', loadFunction, rejectReimbursement);
  bot.callbackQuery(
    /^rejectReimbursement-/,
    loadFunction,
    rejectReimbursementFunction
  );
  bot.callbackQuery(
    'completedReimbursement',
    loadFunction,
    completedReimbursement
  );
  bot.callbackQuery(
    /^completedReimbursement-/,
    loadFunction,
    completedReimbursementWitness
  );
  bot.callbackQuery(
    /^completedReimbursementWitness-/,
    completedReimbursementAmount
  );
  bot.callbackQuery(
    /^completedReimbursementAmount-/,
    completedReimbursementFunction
  );
  bot.callbackQuery('deleteReimbursements', loadFunction, deleteReimbursements);
  bot.callbackQuery(
    /^deleteReimbursements-/,
    loadFunction,
    deleteReimbursementFunction
  );

  //Change Finance Password
  bot.callbackQuery(
    'changeFinancePassword',
    loadFunction,
    changeFinancePassword
  );
  bot.callbackQuery(/^changePassword/, loadFunction, cfmPassword);

  //Change Finance Folder
  bot.callbackQuery('changeFinanceFolder', loadFunction, changeFinanceFolder);
  // chat.chooseChat(bot, 'Finance');
};

/**
 * Fund Management Menu
 * - Sends a list of options for fund management.
 * @param ctx The message context.
 */
const fundMenu = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add Funds',
        callback_data: 'addFunds',
      },
    ],
    [
      {
        text: 'Remove Funds',
        callback_data: 'rmFunds',
      },
    ],
  ]);
  await ctx.reply('Choose an option:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Logs Witness for Funds
 * @param ctx The message context.
 */
const addFunds = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const names = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    names.map((n) => [
      {
        text: n.nameText,
        callback_data: `addFunds-${n.nameText}`,
      },
    ])
  );
  await ctx.reply('Please select the witness:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Logs Funds Amount
 * @param ctx The message context.
 */
const addFundsAmount = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring('addFunds-'.length);
  ctx.session.name = callback;
  await ctx.reply('Please input Funds amount ($SGD):', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 13;
};

/**
 * Deletes Funds
 * @param ctx The message context.
 */
const deleteFunds = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
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
const reimbursementMenu = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find();
  const pendingApproval = claims.filter(
    (n) => n.status === 'Pending Approval 🟠'
  );
  const pendingReimbursment = claims.filter(
    (n) => n.status === 'Pending Reimbursement 🟠'
  );
  const financeSheet = await gsheet('finance');
  const reimburseSheet = financeSheet.sheetsByTitle['Reimbursement'];
  await reimburseSheet.loadCells('K1:K1');
  const completedClaims: number =
    reimburseSheet.getCellByA1('K1').numberValue || 0;
  const reimburse = claims.map((n) => n.amount).reduce((a, b) => a + b, 0);
  const awaitingApprovedClaims = pendingApproval.length;
  const awaitingReimbursementClaims = pendingReimbursment.length;
  const totalClaims = claims.length + completedClaims;
  const inlineKeyboard = new InlineKeyboard([
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
  await ctx.reply(
    `<b>All Statuses:</b>\nPending Approval 🟠\nPending Reimbursement 🟠\nCompleted ✅\n\nTo Be Reimbursed Amount: $${reimburse}\n\nTotal Claims: ${totalClaims}\nAwaiting Approval: ${awaitingApprovedClaims}\nAwaiitng Reimbursement: ${awaitingReimbursementClaims}\nCompleted: ${completedClaims}`,
    {
      reply_markup: inlineKeyboard,
      parse_mode: 'HTML',
    }
  );
};

/**
 * View All Claims
 * - Sends all claims to the finance chat.
 * @param ctx The message context.
 */
const viewAllClaims = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const approvalClaims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Approval 🟠',
  });
  const reimbursementClaims = await Database.getMongoRepository(Claims).find({
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
const approveReimbursement = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Approval 🟠',
  });
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
        callback_data: `approveReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to approve:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Approve Reimbursement Function
 * - Approves the selected claim.
 * @param ctx The message context.
 */
const approveReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'approveReimbursement-'.length
  );

  const financeGSheet = await gsheet('finance');
  const claimsSheet = financeGSheet.sheetsByTitle['Claims'];

  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });
  const name = await Database.getMongoRepository(Names).findOneBy({
    teleUser: ctx.update.callback_query.from.username,
  });
  await claimsSheet.loadCells();

  const claimRowNo = await searchRowNo(
    callback,
    claimsSheet,
    'A',
    2,
    claimsSheet.rowCount
  );
  const claimRows = await claimsSheet.getRows({});
  let row: GoogleSpreadsheetRow | null = null;

  if (!claim || !name) {
    await ctx.reply('Invalid Claim');
    return;
  }
  if (claimRowNo != -1 && claimRowNo) {
    row = claimRows[claimRowNo - 2];
  } else {
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
  const savedDBEntry = await Database.getMongoRepository(Claims).save(claim);

  if (!savedDBEntry) {
    await ctx.reply('Invalid Claim');
    return;
  }

  if (row) {
    row.set('Status', status);
    row.set('Approved by', name.nameText);
    row.save();
  } else {
    await ctx.reply('Invalid Claim');
    return;
  }

  await ctx.reply('Claim Approved');
  ctx.session = initial();
};

/**
 * Reject Reimbursement
 * - Sends a list of claims to reject.
 * @param ctx The message context.
 */
const rejectReimbursement = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const approvedClaims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Approval 🟠',
  });
  const reimbursementClaims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Reimbursement 🟠',
  });
  const claims = approvedClaims.concat(reimbursementClaims);
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
        callback_data: `rejectReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to reject:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Reject Reimbursement Function
 * - Rejects the selected claim.
 * @param ctx The message context.
 */
const rejectReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'rejectReimbursement-'.length
  );
  const financeGSheet = await gsheet('finance');
  const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
  await claimsSheet.loadCells();
  const claimRowNo = await searchRowNo(
    callback,
    claimsSheet,
    'A',
    2,
    claimsSheet.rowCount
  );

  const claimRows = await claimsSheet.getRows({});
  let row: GoogleSpreadsheetRow | null = null;

  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });

  if (!claim) {
    await ctx.reply('Invalid Claim');
    return;
  }
  if (claimRowNo != -1 && claimRowNo) {
    row = claimRows[claimRowNo - 2];
  } else {
    await ctx.reply('Invalid Claim');
    return;
  }

  const user = await Database.getMongoRepository(Names).findOneBy({
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
  await Database.getMongoRepository(Claims).deleteOne({
    claimid: callback,
  });
  await row.delete();
  await dbMessaging.sendMessageUser(
    teleUser,
    `Your claim (${desc}) has been rejected. Please contact the finance personnel if you have any queries!`,
    ctx
  );
  await ctx.reply(`Claim ${desc} Rejected. User has been notified`);
  ctx.session = initial();
};

/**
 * Completed Reimbursement
 * - Sends a list of claims to complete.
 * @param ctx The message context.
 */
const completedReimbursement = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Reimbursement 🟠',
  });
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
        callback_data: `completedReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to complete:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Completed Reimbursement Witness
 * - Sends a list of witnesses to complete the claim.
 * @param ctx The message context.
 */
const completedReimbursementWitness = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'completedReimbursement-'.length
  );
  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });
  if (!claim) {
    await ctx.reply('Invalid Claim');
    return;
  }
  ctx.session.claimId = callback;
  const names = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    names.map((n) => [
      {
        text: n.nameText,
        callback_data: `completedReimbursementWitness-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply('Choose witness:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Completed Reimbursement Amount
 * - Completes the claim with the exact amount.
 * @param ctx The message context.
 */
const completedReimbursementAmount = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'completedReimbursementWitness-'.length
  );
  const claimid = ctx.session.claimId;
  const witness = await Database.getRepository(Names).findOneBy({
    teleUser: callback,
  });
  if (!witness) {
    await ctx.reply('Invalid Witness');
    return;
  }
  ctx.session.reminderUser = witness.nameText;
  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: claimid,
  });
  if (!claim) {
    await ctx.reply('Invalid Claim');
    return;
  }

  await ctx.reply(
    `This is the claim amount ${claim.amount}. Did you reimburse this EXACT amount?`,
    {
      reply_markup: new InlineKeyboard([
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
    }
  );
};
/**
 * Completed Reimbursement Function
 * - Completes the claim with the exact amount.
 * @param ctx The message context.
 */
const completedReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'completedReimbursementAmount-'.length
  );
  const claimid = ctx.session.claimId;
  const witness = ctx.session.reminderUser;
  const user = ctx.callbackQuery.from.username;
  if (claimid && user && witness) {
    const claim = await Database.getMongoRepository(Claims).findOneBy({
      claimid: claimid,
    });
    const userDoc = await Database.getMongoRepository(Names).findOneBy({
      teleUser: user,
    });
    if (!claim || !userDoc) {
      await ctx.reply('Invalid Claim');
      return;
    }
    if (callback === 'Yes') {
      const financeGSheet = await gsheet('finance');
      const reimbursementSheet = financeGSheet.sheetsByTitle['Reimbursement'];
      const allRecordSheet = financeGSheet.sheetsByTitle['All Records'];
      const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
      await claimsSheet.loadCells();
      const claimRowNo = await searchRowNo(
        claimid,
        claimsSheet,
        'A',
        2,
        claimsSheet.rowCount
      );

      const claimRows = await claimsSheet.getRows({});
      let row: GoogleSpreadsheetRow | null = null;
      if (claimRowNo != -1) {
        row = claimRows[claimRowNo - 2];
      } else {
        await ctx.reply('Invalid Claim!');
        return;
      }
      const uuid = uuidv4();
      const dateTime = DateTime.now()
        .setZone('Asia/Singapore')
        .toFormat('dd/mm/yyyy hh:mm:ss');
      const claimMsg = `Claim submitted by\n${claim.name}\n${claim.date}\nClaim ID: ${claim.claimid}\n\n<b>Completed ✅</b>\n\nAmount: $${claim.amount}\nDescription: ${claim.description}`;
      claim.msg = claimMsg;
      claim.status = 'Completed ✅';
      const savedDBEntry =
        await Database.getMongoRepository(Claims).save(claim);
      if (!savedDBEntry) {
        await ctx.reply('Something went wrong! Pls try again!');
        return;
      }
      if (row) {
        row.set('Status', 'Completed ✅');
        row.save();
      } else {
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
      ctx.session = initial();
    } else {
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
const deleteReimbursements = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find({
    status: 'Completed ✅',
  });
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description + ' ( ' + n.name + '  ) - ' + n.date,
        callback_data: `deleteReimbursements-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to delete:', {
    reply_markup: inlineKeyboard,
  });
};

/**
 * Delete Reimbursement Function
 * - Deletes the selected claim.
 * @param ctx The message context.
 */
const deleteReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'deleteReimbursements-'.length
  );

  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });
  if (!claim) {
    await ctx.reply('Invalid Claim');
    return;
  }

  const financeGSheet = await gsheet('finance');
  const claimsSheet = financeGSheet.sheetsByTitle['Claims'];
  const allRecordSheet = financeGSheet.sheetsByTitle['All Records'];
  const reimbursementSheet = financeGSheet.sheetsByTitle['Reimbursement'];

  await claimsSheet.loadCells();
  await allRecordSheet.loadCells();
  await reimbursementSheet.loadCells();

  const claimRowNo = await searchRowNo(
    callback,
    claimsSheet,
    'A',
    2,
    claimsSheet.rowCount
  );
  const allRecordRowNo = await searchRowNo(
    callback,
    allRecordSheet,
    'B',
    2,
    allRecordSheet.rowCount
  );
  const reimbursementRowNo = await searchRowNo(
    callback,
    reimbursementSheet,
    'B',
    2,
    reimbursementSheet.rowCount
  );
  const claimRows = await claimsSheet.getRows({});
  const allRecordRows = await allRecordSheet.getRows({});
  const reimbursementRows = await reimbursementSheet.getRows({});
  let claimRow: GoogleSpreadsheetRow | null = null;
  let allRecordRow: GoogleSpreadsheetRow | null = null;
  let reimbursementRow: GoogleSpreadsheetRow | null = null;

  if (
    claimRowNo != -1 &&
    claimRowNo &&
    allRecordRowNo != -1 &&
    allRecordRowNo &&
    reimbursementRowNo != -1 &&
    reimbursementRowNo
  ) {
    claimRow = claimRows[claimRowNo - 2];
    allRecordRow = allRecordRows[allRecordRowNo - 2];
    reimbursementRow = reimbursementRows[reimbursementRowNo - 2];
  } else {
    await ctx.reply('Invalid Claim');
    return;
  }

  if (claimRow && allRecordRow && reimbursementRow) {
    await claimRow.delete();
    await allRecordRow.delete();
    await reimbursementRow.delete();
  } else {
    await ctx.reply('Invalid Claim');
    return;
  }

  await Database.getMongoRepository(Claims).deleteOne({
    claimid: callback,
  });
  await ctx.reply('Claim Deleted');
};

/**
 * Change Finance Password
 * - Changes the finance password.
 * @param ctx The message context.
 */
const changeFinancePassword = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);

  await ctx.reply('Please input current password:', {});
  ctx.session.botOnType = 17;
};

/**
 * Confirm Password
 * - Confirms the password change.
 * @param ctx The message context.
 */
const cfmPassword = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'changePassword'.length
  );
  if (callback === 'Yes') {
    const password = ctx.session.text as string;
    const config = await Database.getMongoRepository(Settings).findOneBy({
      option: 'LG',
    });
    if (!config) {
      await ctx.reply('Invalid Password');
      return;
    }
    config.config[2] = password;
    await Database.getMongoRepository(Settings).save(config);
    process.env.FINANCE_PASSWORD = password;
    ctx.session = initial();
    await ctx.reply(
      'Password changed! Please delete chat history for security!'
    );
    ctx.session = initial();
  } else {
    await ctx.reply('Password not changed, Please enter another new password');
    ctx.session.botOnType = 18;
  }
};

/**
 * Change Finance Folder
 * - Changes the finance folder.
 * @param ctx The message context.
 */
const changeFinanceFolder = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  await ctx.reply('Please input new folder ID:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 34;
};
