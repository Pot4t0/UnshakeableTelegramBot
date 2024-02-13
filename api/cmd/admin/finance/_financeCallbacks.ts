import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { loadFunction, removeInLineButton } from '../../../app/_telefunctions';
import {
  chat,
  dbMessaging,
  gSheetDB,
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

export const adminFinance = (bot: Bot<BotContext>) => {
  //Finance Team Management
  team.teamManagement(bot, 'Finance');

  //Fund Management
  bot.callbackQuery('fundManagement', loadFunction, fundMenu);
  bot.callbackQuery('addOffering', addOffering);
  bot.callbackQuery(/^addOffering-/, addOfferingAmount);
  bot.callbackQuery('rmOffering', deleteOffering);

  //Reimbursement Management
  bot.callbackQuery('reimbursementManagement', loadFunction, reimbursementMenu);
  bot.callbackQuery('approveReimbursement', approveReimbursement);
  bot.callbackQuery(/^approveReimbursement-/, approveReimbursementFunction);
  bot.callbackQuery('rejectReimbursement', rejectReimbursement);
  bot.callbackQuery(/^rejectReimbursement-/, rejectReimbursementFunction);
  bot.callbackQuery('completedReimbursement', completedReimbursement);
  bot.callbackQuery(/^completedReimbursement-/, completedReimbursementWitness);
  bot.callbackQuery(
    /^completedReimbursementWitness-/,
    completedReimbursementAmount
  );
  bot.callbackQuery(
    /^completedReimbursementAmount-/,
    completedReimbursementFunction
  );

  //Change Finance Password
  bot.callbackQuery('changeFinancePassword', changeFinancePassword);
  bot.callbackQuery(/^changePassword/, cfmPassword);

  //Change Finance Chat
  chat.chooseChat(bot, 'Finance');
};

const fundMenu = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
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

const addOffering = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const names = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    names.map((n) => [
      {
        text: n.nameText,
        callback_data: `addOffering-${n.nameText}`,
      },
    ])
  );
  await ctx.reply('Please select the witness:', {
    reply_markup: inlineKeyboard,
  });
};
const addOfferingAmount = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'addOffering-'.length
  );
  ctx.session.name = callback;
  await ctx.reply('Please input offering amount ($SGD):', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 13;
};
const deleteOffering = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  await ctx.reply('Please input Transaction Id:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 15;
};

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
  await ctx.reply(
    `<b>All Statuses:</b>\nPending Approval 🟠\nPending Reimbursement 🟠\nCompleted ✅\n\nTo Be Reimbursed Amount: $${reimburse}\n\nTotal Claims: ${totalClaims}\nAwaiting Approval: ${awaitingApprovedClaims}\nAwaiitng Reimbursement: ${awaitingReimbursementClaims}\nCompleted: ${completedClaims}`,
    {
      reply_markup: inlineKeyboard,
      parse_mode: 'HTML',
    }
  );
};

const approveReimbursement = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Approval 🟠',
  });
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description,
        callback_data: `approveReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to approve:', {
    reply_markup: inlineKeyboard,
  });
};

const approveReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = parseInt(
    ctx.update.callback_query.data.substring('approveReimbursement-'.length)
  );

  const claim = await Database.getMongoRepository(Claims).findOneBy({
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
  await Database.getMongoRepository(Claims).save(claim);
  await ctx.api.editMessageCaption(
    process.env.LG_FINANCE_CLAIM || '',
    callback,
    {
      caption: `Claim submitted by\n${user}\n${formattedDate}\nClaim ID: ${claimid}\n\n<b>${status}</b>\n\nAmount: $${amount}\nDescription: ${reason}`,
      parse_mode: 'HTML',
    }
  );
  await ctx.reply('Claim Approved');
  ctx.session = initial();
};

const rejectReimbursement = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);
  const claims = await Database.getMongoRepository(Claims).find({
    status: 'Pending Approval 🟠',
  });
  const inlineKeyboard = new InlineKeyboard(
    claims.map((n) => [
      {
        text: n.description,
        callback_data: `rejectReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to reject:', {
    reply_markup: inlineKeyboard,
  });
};

const rejectReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = parseInt(
    ctx.update.callback_query.data.substring('rejectReimbursement-'.length)
  );

  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });

  if (!claim) {
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
  const teleUser = user.teleUser;
  const desc = claim.description;
  await Database.getMongoRepository(Claims).deleteOne({
    claimid: callback,
  });
  await ctx.api.deleteMessage(process.env.LG_FINANCE_CLAIM || '', callback);
  await dbMessaging.sendMessageUser(
    teleUser,
    `Your claim (${desc}) has been rejected. Please contact the finance personnel if you have any queries!`,
    ctx
  );
  await ctx.reply(`Claim ${desc} Rejected. User has been notified`);
  ctx.session = initial();
};

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
        text: n.description,
        callback_data: `completedReimbursement-${n.claimid}`,
      },
    ])
  );
  await ctx.reply('Choose claim to complete:', {
    reply_markup: inlineKeyboard,
  });
};
const completedReimbursementWitness = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = parseInt(
    ctx.update.callback_query.data.substring('completedReimbursement-'.length)
  );
  const claim = await Database.getMongoRepository(Claims).findOneBy({
    claimid: callback,
  });
  if (!claim) {
    await ctx.reply('Invalid Claim');
    return;
  }
  ctx.session.chatId = callback;
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

const completedReimbursementAmount = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'completedReimbursementWitness-'.length
  );
  const claimid = ctx.session.chatId;
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
const completedReimbursementFunction = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  removeInLineButton(ctx);
  const callback = ctx.update.callback_query.data.substring(
    'completedReimbursementAmount-'.length
  );
  const claimid = ctx.session.chatId;
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
      const uuid = uuidv4();
      const dateTime = DateTime.now()
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
      await ctx.api.editMessageCaption(
        process.env.LG_FINANCE_CLAIM || '',
        claimid,
        {
          caption: `Claim submitted by\n${claim.name}\n${claim.date}\nClaim ID: ${claim.claimid}\n\n<b>Completed ✅</b>\n\nAmount: $${claim.amount}\nDescription: ${claim.description}`,
          parse_mode: 'HTML',
        }
      );

      await Database.getMongoRepository(Claims).deleteOne({
        claimid: claimid,
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

const changeFinancePassword = async (ctx: CallbackQueryContext<BotContext>) => {
  removeInLineButton(ctx);

  await ctx.reply('Please input current password:', {});
  ctx.session.botOnType = 17;
};

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

const changeFinanceChat = async (ctx: CallbackQueryContext<BotContext>) => {};
