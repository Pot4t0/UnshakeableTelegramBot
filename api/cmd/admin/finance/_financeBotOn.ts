import { Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import { Database } from '../../../database_mongoDB/_db-init';
import { Claims, Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { gsheet } from '../../../functions/_initialise';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { searchRowNo } from '../../../gsheets/_gsheet_functions';

//Main Finance Menu
//Used in _botOn_functions.ts in botOntype = 12
export const adminFinanceMenu = async (ctx: Filter<BotContext, 'message'>) => {
  const password = process.env.FINANCE_PASSWORD;
  if (ctx.message.text !== password && !ctx.session.financeAccess) {
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
    [
      {
        text: 'Change Google Sheet',
        callback_data: 'changeFinanceSheet',
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
// Add Offering Date
// Used in _botOn_functions.ts in botOntype = 14
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
// Add Offering Record
// Used in _botOn_functions.ts in botOntype = 14
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
// Delete Offering Record
// Used in _botOn_functions.ts in botOntype = 15
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

// Add Completed Claim Amount
// Used in _botOn_functions.ts in botOntype = 16
export const completedClaimAmountNo = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const amount = ctx.message.text;
  const claimid = ctx.session.chatId;
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
    const uuid = uuidv4();
    const dateTime = DateTime.now()
      .setZone('Asia/Singapore')
      .toFormat('dd/mm/yyyy hh:mm:ss');
    await reimbursementSheet.addRow({
      'Transaction ID': uuid,
      'Claim ID': claimid,
      Timestamp: dateTime,
      Date: claim.date,
      Amount: -amount,
      Description: claim.description,
      'Approved by': userDoc.nameText,
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
      Witness: witness,
    });

    await Database.getMongoRepository(Claims).deleteOne({
      claimid: claimid,
    });
    await ctx.api.deleteMessage(process.env.LG_FINANCE_CLAIM || '', claimid);
    await ctx.reply('Claim Completed');
  }
};

// Change Password
// Used in _botOn_functions.ts in botOntype = 17
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

// Cfm Change Password
// Used in _botOn_functions.ts in botOntype = 18
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
