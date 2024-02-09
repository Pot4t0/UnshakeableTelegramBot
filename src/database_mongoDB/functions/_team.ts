import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../../app/_context';
import { Database } from '../_db-init';
import { Names } from '../Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { loadFunction, removeInLineButton } from '../../app/_telefunctions';

export const teamManagement = async (
  bot: Bot<BotContext>,
  team: 'Welfare' | 'Admin' | 'Birthday' | 'Leaders'
  //   |'Attendance'
) => {
  let userRole: 'welfare' | 'admin' | 'bday' | 'leaders';
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
    case 'Leaders':
      userRole = 'leaders';
      break;
    default:
      throw new Error('Invalid Team');
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
  team: 'Welfare' | 'Admin' | 'Birthday' | 'Leaders',
  userRole: 'welfare' | 'admin' | 'bday' | 'leaders'
) => {
  await removeInLineButton(ctx);
  let icText = 'Make User be IC/Member';
  if (userRole === 'leaders') {
    icText = 'Make User be SGL/LGL';
  }
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
        text: icText,
        callback_data: `editMember`,
      },
    ],
  ]);
  ctx.session.team = team;
  ctx.session.userRole = userRole;
  if (team != 'Leaders') {
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
        .join('\n')}\n\nMembers:\n${userList
        .map((n) => n.nameText)
        .join('\n')}`,
      {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    const userList = await Database.getMongoRepository(Names).find({
      where: {
        role: { $in: ['SGL'] },
      },
    });
    const icList = await Database.getMongoRepository(Names).find({
      where: {
        role: { $in: ['LGL'] },
      },
    });
    await ctx.reply(
      `<b>${team} Team</b>\n\nLGL:\n${icList
        .map((n) => n.nameText)
        .join('\n')}\n\nSGL:\n${userList.map((n) => n.nameText).join('\n')}`,
      {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      }
    );
  }
};

const addMember = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    let namelist: Names[];
    if (team != 'Leaders') {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $not: { $in: [userRole, userRole + 'IC'] } },
        },
      });
    } else {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $not: { $in: ['SGL', 'LGL'] } },
        },
      });
    }
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
  if (team != 'Leaders') {
    if (userRole && team) {
      const userRoleList = await (
        await Database.getMongoRepository(Names).find({
          nameText: selectedName,
        })
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
  } else {
    if (userRole && team) {
      const userRoleList = await (
        await Database.getMongoRepository(Names).find({
          nameText: selectedName,
        })
      )
        .flatMap((n) => n.role)
        .flat()
        .concat(['SGL']);
      await Database.getMongoRepository(Names).updateOne(
        { nameText: selectedName },
        { $set: { role: userRoleList } }
      );
      await ctx.reply(`${selectedName} added into ${team} Team`);
    } else {
      ctx.reply('Error: Please try again');
      console.log('Sessions Failed (userRole/team)');
    }
  }

  ctx.session = initial();
};

const delMember = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    let namelist: Names[];
    if (team !== 'Leaders') {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $in: [userRole, userRole + 'IC'] },
        },
      });
    } else {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $in: ['SGL', 'LGL'] },
        },
      });
    }
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
    ctx.session = initial();
  }
};
const delMember_Execution = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const userRole = ctx.session.userRole;
  const team = ctx.session.team;
  if (userRole && team) {
    const selectedName = await ctx.update.callback_query.data.substring(
      'delMemberUser-'.length
    );
    let userRoleList = (
      await Database.getMongoRepository(Names).find({ nameText: selectedName })
    ).flatMap((n) => n.role);
    if (team != 'Leaders') {
      if (userRoleList.includes(userRole)) {
        userRoleList.splice(userRoleList.indexOf(userRole, 1));
      } else if (userRoleList.includes(userRole + 'IC')) {
        userRoleList.splice(userRoleList.indexOf(userRole + 'IC', 1));
      } else {
        throw new Error('Invalid Role');
      }
    } else {
      if (userRoleList.includes('SGL')) {
        userRoleList.splice(userRoleList.indexOf('SGL', 1));
      } else if (userRoleList.includes('LGL')) {
        userRoleList.splice(userRoleList.indexOf('LGL', 1));
      } else {
        throw new Error('Invalid Role');
      }
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
    let namelist: Names[];
    if (team != 'Leaders') {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $in: [userRole, userRole + 'IC'] },
        },
      });
    } else {
      namelist = await Database.getMongoRepository(Names).find({
        where: {
          role: { $in: ['SGL', 'LGL'] },
        },
      });
    }
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
    let editRole = (
      await Database.getMongoRepository(Names).find({ nameText: selectedName })
    ).flatMap((n) => n.role);
    let changeRole = '';
    if (team != 'Leaders') {
      if (editRole.includes(userRole)) {
        editRole.splice(editRole.indexOf(userRole, 1));
        changeRole = team + ' IC';
        editRole.push(userRole + 'IC');
      } else if (editRole.includes(userRole + 'IC')) {
        editRole.splice(editRole.indexOf(userRole + 'IC', 1));
        changeRole = team + ' Member';
        editRole.push(userRole);
      } else {
        throw new Error('Invalid Role');
      }
    } else {
      if (editRole.includes('SGL')) {
        editRole.splice(editRole.indexOf('SGL', 1));
        changeRole = 'LGL';
        editRole.push('LGL');
      } else if (editRole.includes('LGL')) {
        editRole.splice(editRole.indexOf('LGL', 1));
        changeRole = 'SGL';
        editRole.push('SGL');
      } else {
        throw new Error('Invalid Role');
      }
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
