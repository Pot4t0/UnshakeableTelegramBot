import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_context';
import { Database } from '../_db-init';
import { Names } from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

export const teamManagement = async (
  bot: Bot<BotContext>,
  team: 'Welfare' | 'Admin' | 'Birthday'
  //   |'Attendance'
) => {
  let userRole: 'welfare' | 'admin' | 'bday';
  switch (team) {
    // currently nonexistent
    // case 'Attendance':
    //   userRole = 'attendance';
    //   break;
    case 'Welfare':
      userRole = 'welfare';
      break;
    case 'Admin':
      userRole = 'admin';
      break;
    case 'Birthday':
      userRole = 'bday';
      break;
    default:
      userRole = 'bday';
  }
  bot.callbackQuery(`manage${team}Team`, loadFunction, async (ctx) => {
    await teamManagementMenu(ctx, team, userRole);
  });
  bot.callbackQuery(`addMember`, loadFunction, async (ctx) => {
    await addMember(ctx);
  });
  bot.callbackQuery(/^addMemberUser-/g, loadFunction, async (ctx) => {
    await addMember_Execution(ctx);
  });
  bot.callbackQuery(`delMember`, loadFunction, async (ctx) => {
    await delMember(ctx);
  });
  bot.callbackQuery(/^delMemberUser-/g, loadFunction, async (ctx) => {
    await delMember_Execution(ctx);
  });
  bot.callbackQuery(`editMember`, loadFunction, async (ctx) => {
    await editMember(ctx);
  });
  bot.callbackQuery(/^editMemberUser-/g, loadFunction, async (ctx) => {
    await editMember_Execution(ctx);
  });
};
const teamManagementMenu = async (
  ctx: CallbackQueryContext<BotContext>,
  team: 'Welfare' | 'Admin' | 'Birthday',
  //| 'Attendance'
  userRole: 'welfare' | 'admin' | 'bday'
) => {
  await removeInLineButton(ctx);
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add Member',
        callback_data: `addMember`,
      },
    ],
    [
      {
        text: 'Delete Members',
        callback_data: `delMember`,
      },
    ],
    [
      {
        text: 'Make User be IC/Member',
        callback_data: `editMember`,
      },
    ],
  ]);
  ctx.session.team = team;
  ctx.session.userRole = userRole;
  const userList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: [userRole] },
    },
  });
  const icList = await Database.getMongoRepository(Names).find({
    where: {
      role: { $in: [userRole + 'IC'] },
    },
  });
  await ctx.reply(
    `<b>${team} Team</b>\n\nIC:\n${icList
      .map((n) => n.nameText)
      .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`,
    {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard,
    }
  );
};

const addMember = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const namelist = await Database.getMongoRepository(Names).find({
      where: {
        role: { $not: { $in: [userRole, userRole + 'IC'] } },
      },
    });
    const inlineKeyboard = new InlineKeyboard(
      namelist.map((w) => [
        {
          text: w.nameText,
          callback_data: `addMemberUser-${w.nameText}`,
        },
      ])
    );
    await ctx.reply(`Choose user to add into ${team} team`, {
      reply_markup: inlineKeyboard,
    });
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
};
const addMember_Execution = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const selectedName = await ctx.update.callback_query.data.substring(
    'addMemberUser-'.length
  );
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const userRoleList = await (
      await Database.getMongoRepository(Names).find({ nameText: selectedName })
    )
      .flatMap((n) => n.role)
      .flat()
      .concat([userRole]);
    await Database.getMongoRepository(Names).updateOne(
      { nameText: selectedName },
      { $set: { role: userRoleList } }
    );
    await ctx.reply(`${selectedName} added into ${team} Team`);
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
  ctx.session = initial();
};

const delMember = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const namelist = await Database.getMongoRepository(Names).find({
      where: {
        role: { $in: [userRole, userRole + 'IC'] },
      },
    });
    const inlineKeyboard = new InlineKeyboard(
      namelist.map((w) => [
        {
          text: w.nameText,
          callback_data: `delMemberUser-${w.nameText}`,
        },
      ])
    );
    await ctx.reply(`Choose user to remove from ${team} team`, {
      reply_markup: inlineKeyboard,
    });
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
  ctx.session = initial();
};
const delMember_Execution = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const selectedName = await ctx.update.callback_query.data.substring(
      'delMemberUser-'.length
    );
    let userRoleList = await (
      await Database.getMongoRepository(Names).find({ nameText: selectedName })
    ).flatMap((n) => n.role);
    if (userRoleList.includes(userRole)) {
      await userRoleList.splice(userRoleList.indexOf(userRole, 1));
    } else if (userRoleList.includes(userRole + 'IC')) {
      await userRoleList.splice(userRoleList.indexOf(userRole + 'IC', 1));
    }
    await Database.getMongoRepository(Names).updateOne(
      { nameText: selectedName },
      { $set: { role: userRoleList } }
    );
    await ctx.reply(`${selectedName} removed from ${team} Team`);
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
  ctx.session = initial();
};

const editMember = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const namelist = await Database.getMongoRepository(Names).find({
      where: {
        role: { $in: [userRole, userRole + 'IC'] },
      },
    });
    const inlineKeyboard = new InlineKeyboard(
      namelist.map((w) => [
        {
          text: w.nameText,
          callback_data: `editMemberUser-${w.nameText}`,
        },
      ])
    );
    await ctx.reply(`Choose user to become IC/Member from ${team} team`, {
      reply_markup: inlineKeyboard,
    });
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
};

const editMember_Execution = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const selectedName = await ctx.update.callback_query.data.substring(
    'editMemberUser-'.length
  );
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    let editRole = await (
      await Database.getMongoRepository(Names).find({ nameText: selectedName })
    ).flatMap((n) => n.role);
    let changeRole = '';
    if (editRole.includes(userRole)) {
      await editRole.splice(editRole.indexOf(userRole, 1));
      changeRole = team + ' IC';
      await editRole.push(userRole + 'IC');
    } else if (editRole.includes(userRole + 'IC')) {
      await editRole.splice(editRole.indexOf(userRole + 'IC', 1));
      changeRole = team + ' Member';
      await editRole.push(userRole);
    }
    await Database.getMongoRepository(Names).updateOne(
      { nameText: selectedName },
      { $set: { role: editRole } }
    );
    await ctx.reply(`${selectedName} changed to ${changeRole}`);
  } else {
    ctx.reply('Error: Please try again');
    console.log('Sessions Failed (userRole/team)');
  }
  ctx.session = initial();
};
