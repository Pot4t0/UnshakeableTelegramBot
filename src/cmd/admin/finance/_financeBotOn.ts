import { Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import { Database } from '../../../database_mongoDB/_db-init';
import { Claims, Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { gsheet } from '../../../functions/_initialise';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { searchRowNo } from '../../../gsheets/_gsheet_functions';
import { GoogleSpreadsheetRow } from 'google-spreadsheet';

/**
 * Main Finance Menu. Accessible only by the finance team and requires a password.
 * Used in _botOn_functions.ts
 * - botOntype = 12
 * @param ctx The message context.
 * @throws Error if the password is invalid.
 */
export const adminFinanceMenu = async (ctx: BotContext) => {
  const password = process.env.FINANCE_PASSWORD;
  if (ctx.message?.text !== password) {
    await ctx.reply('Invalid Password');
    return;
  }
  ctx.session = initial();

  if (!ctx.session.financeAccess) {
    ctx.session.financeAccess = true;
  }
  const claims = await Database.getMongoRepository(Claims).find();
  const pendingApproval = claims.filter(
    (n) => n.status === 'Pending Approval 🟠'
  );
  const pendingReimbursment = claims.filter(
    (n) => n.status === 'Pending Reimbursement 🟠'
  );
  const financeSheet = await gsheet('finance');
  const allRecordSheet = financeSheet.sheetsByTitle['All Records'];
  const reimburseSheet = financeSheet.sheetsByTitle['Reimbursement'];
  await reimburseSheet.loadCells('K1:K1');
  await allRecordSheet.loadCells('P1:P1');
  const funds = allRecordSheet.getCellByA1('P1').value;
  const reimburse = claims.map((n) => n.amount).reduce((a, b) => a + b, 0);
  const awaitingApprovedClaims = pendingApproval.length;
  const awaitingReimbursementClaims = pendingReimbursment.length;
  const completedClaims: number =
    reimburseSheet.getCellByA1('K1').numberValue || 0;
  const totalClaims = claims.length + completedClaims;
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Manage Finance Team',
        callback_data: 'manageFinanceTeam',
      },
    ],
    [
      {
        text: 'Fund Management',
        callback_data: 'fundManagement',
      },
    ],
    [
      {
        text: 'Reimbursement',
        callback_data: 'reimbursementManagement',
      },
    ],
    [
      {
        text: 'Change Password',
        callback_data: 'changeFinancePassword',
      },
    ],
    [
      {
        text: 'Change Finance Chat',
        callback_data: 'changeChatFinance',
      },
    ],
  ]);
  await ctx.reply(
    `<b>Unshakeable Finance Management</b>\n\nCurrent Funds: $${funds}\nTo Be Reimbursed Amount: $${reimburse}\n\nTotal Claims: ${totalClaims}\nAwaiting Approval: ${awaitingApprovedClaims}\nAwaiitng Reimbursement: ${awaitingReimbursementClaims}\nCompleted: ${completedClaims}`,
    {
      reply_markup: inlineKeyboard,
      parse_mode: 'HTML',
    }
  );
  financeSheet.resetLocalCache();
};

/**
 * Logs Offering LG Date
 * Used in _botOn_functions.ts
 * - botOntype = 14
 * @param ctx The message context.
 */
export const addOfferingLGDate = async (ctx: Filter<BotContext, 'message'>) => {
  const amount = ctx.message.text;
  if (amount == null) {
    addOfferingLGDate(ctx);
  } else {
    ctx.session.amount = amount;
    await ctx.reply(
      'Please enter LG Date / date of offering collection (dd/mm/yyyy):'
    );
    ctx.session.botOnType = 14;
  }
};

/**
 * Adds the Offering Record to the Google Sheet.
 * Used in _botOn_functions.ts
 * - Refer to case botOntype = 14
 * @param ctx The message context.
 */
export const addOfferingExecution = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const lgDate = ctx.message.text;
  if (lgDate == null) {
    addOfferingExecution(ctx);
  } else {
    const name = await Database.getMongoRepository(Names).find({
      teleUser: ctx.message.from.username,
    });

    const lgDate = ctx.message.text;
    const amount = ctx.session.amount;
    const witness = ctx.session.name;
    const uuid = uuidv4();
    const counter = name[0].nameText;
    console.log(counter);
    const financeSheet = await gsheet('finance');
    const allRecordSheet = financeSheet.sheetsByTitle['All Records'];
    const offeringSheet = financeSheet.sheetsByTitle['Offering'];
    const dateTime = DateTime.now()
      .setZone('Asia/Singapore')
      .toFormat('dd/mm/yyyy hh:mm:ss');

    if (amount && lgDate && witness && counter) {
      await offeringSheet.addRow({
        'Transaction ID': uuid,
        Timestamp: dateTime,
        Date: lgDate,
        Amount: amount,
        'Counted by': counter,
        Witness: witness,
      });
      await allRecordSheet.addRow({
        'Transaction ID': uuid,
        Timestamp: dateTime,
        Date: lgDate,
        Amount: amount,
        'Counted by': counter,
        Witness: witness,
        Type: 'Offering',
      });
      await ctx.reply('Offering Added');
    } else {
      await ctx.reply('Error in adding offering');
    }
    allRecordSheet.resetLocalCache();
    offeringSheet.resetLocalCache();
    financeSheet.resetLocalCache();
    ctx.session = initial();
  }
};

/**
 * Delete Offering Record
 * Used in _botOn_functions.ts
 * - botOntype = 15
 * @param ctx The message context.
 */
export const deleteOfferingRecord = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const msg = ctx.message.text;
  if (msg == null) {
    deleteOfferingRecord(ctx);
  } else {
    const financeSheet = await gsheet('finance');
    const offeringSheet = financeSheet.sheetsByTitle['Offering'];
    const allRecordSheet = financeSheet.sheetsByTitle['All Records'];
    await offeringSheet.loadCells();
    await allRecordSheet.loadCells();
    const allRecordRowNo = await searchRowNo(
      msg,
      allRecordSheet,
      'A',
      2,
      allRecordSheet.rowCount
    );
    const offeringRowNo = await searchRowNo(
      msg,
      offeringSheet,
      'A',
      2,
      offeringSheet.rowCount
    );
    console.log(allRecordRowNo, offeringRowNo);
    const offeringRow = await offeringSheet.getRows({});
    const allRecordRow = await allRecordSheet.getRows({});
    if (allRecordRowNo != -1 && offeringRowNo != -1) {
      await offeringRow[offeringRowNo - 2].delete();
      await allRecordRow[allRecordRowNo - 2].delete();
      await ctx.reply('Offering Record Deleted');
    } else {
      await ctx.reply('No such transaction ID found');
    }
    offeringSheet.resetLocalCache();
    allRecordSheet.resetLocalCache();
    ctx.session = initial();
  }
};

/**
 * Logs Reimbursement Amount
 * Used in _botOn_functions.ts
 * - botOntype = 16
 * @param ctx The message context.
 */
export const completedClaimAmountNo = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const amount = ctx.message.text;
  const claimid = ctx.session.claimId;
  const witness = ctx.session.reminderUser;
  const user = ctx.message.from.username;
  if (amount == null || claimid == null || witness == null || user == null) {
    completedClaimAmountNo(ctx);
  } else {
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
    const savedDBEntry = await Database.getMongoRepository(Claims).save(claim);
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
      Amount: -amount,
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
      Amount: -amount,
      Description: claim.description,
      'Approved by': userDoc.nameText,
      'Claimed by': claim.name,
      Witness: witness,
    });

    await ctx.reply('Claim Completed');
  }
};

/**
 * Changes the password for the finance team.
 * Used in _botOn_functions.ts
 * - botOntype = 17
 * @param ctx The message context.
 */
export const passwordCheck = async (ctx: Filter<BotContext, 'message'>) => {
  const password = process.env.FINANCE_PASSWORD;
  if (ctx.message.text !== password) {
    await ctx.reply('Invalid Password, Please try again');
    ctx.session.botOnType = 17;
    return;
  }
  ctx.session = initial();
  await ctx.reply('Please enter new password:');
  ctx.session.botOnType = 18;
};

/**
 * Confirms the password change.
 * Used in _botOn_functions.ts
 * - botOntype = 18
 * @param ctx The message context.
 */
export const cfmChangePassword = async (ctx: Filter<BotContext, 'message'>) => {
  const password = ctx.message.text;
  if (password == null) {
    cfmChangePassword(ctx);
  } else {
    ctx.session.text = password;
    await ctx.reply(`Password is ${password}, are you sure?`, {
      reply_markup: new InlineKeyboard([
        [{ text: 'Yes', callback_data: 'changePasswordYes' }],
        [{ text: 'No', callback_data: 'changePasswordNo' }],
      ]),
    });
  }
};
