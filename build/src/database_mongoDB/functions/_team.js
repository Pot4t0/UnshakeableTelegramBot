"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamManagement = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _telefunctions_1 = require("../../app/_telefunctions");
const teamManagement = async (bot, team
//   |'Attendance'
) => {
    let userRole;
    switch (team) {
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
        case 'Finance':
            userRole = 'finance';
            break;
        default:
            throw new Error('Invalid Team');
    }
    bot.callbackQuery(`manage${team}Team`, _telefunctions_1.loadFunction, async (ctx) => {
        await teamManagementMenu(ctx, team, userRole);
    });
    bot.callbackQuery(`addMember`, _telefunctions_1.loadFunction, async (ctx) => {
        await addMember(ctx);
    });
    bot.callbackQuery(/^addMemberUser-/g, _telefunctions_1.loadFunction, async (ctx) => {
        await addMember_Execution(ctx);
    });
    bot.callbackQuery(`delMember`, _telefunctions_1.loadFunction, async (ctx) => {
        await delMember(ctx);
    });
    bot.callbackQuery(/^delMemberUser-/g, _telefunctions_1.loadFunction, async (ctx) => {
        await delMember_Execution(ctx);
    });
    bot.callbackQuery(`editMember`, _telefunctions_1.loadFunction, async (ctx) => {
        await editMember(ctx);
    });
    bot.callbackQuery(/^editMemberUser-/g, _telefunctions_1.loadFunction, async (ctx) => {
        await editMember_Execution(ctx);
    });
};
exports.teamManagement = teamManagement;
const teamManagementMenu = async (ctx, team, userRole) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    let icText = 'Make User be IC/Member';
    if (userRole === 'leaders') {
        icText = 'Make User be SGL/LGL';
    }
    let inLineButtons = [
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
    ];
    if (userRole === 'finance') {
        inLineButtons = [
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
        ];
    }
    const inlineKeyboard = new grammy_1.InlineKeyboard(inLineButtons);
    ctx.session.team = team;
    ctx.session.userRole = userRole;
    if (team != 'Leaders') {
        const userList = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: [userRole] },
            },
        });
        const icList = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: [userRole + 'IC'] },
            },
        });
        let msg = `<b>${team} Team</b>\n\nIC:\n${icList
            .map((n) => n.nameText)
            .join('\n')}\n\nMembers:\n${userList.map((n) => n.nameText).join('\n')}`;
        if (icList.length === 0) {
            msg = `<b>${team} Team</b>\n\nMembers:\n${userList
                .map((n) => n.nameText)
                .join('\n')}`;
        }
        await ctx.reply(msg, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
        });
    }
    else {
        const userList = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: ['SGL'] },
            },
        });
        const icList = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: ['LGL'] },
            },
        });
        await ctx.reply(`<b>${team} Team</b>\n\nLGL:\n${icList
            .map((n) => n.nameText)
            .join('\n')}\n\nSGL:\n${userList.map((n) => n.nameText).join('\n')}`, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
        });
    }
};
const addMember = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team != 'Leaders') {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $not: { $in: [userRole, userRole + 'IC'] } },
                },
            });
        }
        else {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $not: { $in: ['SGL', 'LGL'] } },
                },
            });
        }
        const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
            {
                text: w.nameText,
                callback_data: `addMemberUser-${w.nameText}`,
            },
        ]));
        await ctx.reply(`Choose user to add into ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
};
const addMember_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const selectedName = await ctx.update.callback_query.data.substring('addMemberUser-'.length);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (team != 'Leaders') {
        if (userRole && team) {
            const userRoleList = await (await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                nameText: selectedName,
            }))
                .flatMap((n) => n.role)
                .flat()
                .concat([userRole]);
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
            await ctx.reply(`${selectedName} added into ${team} Team`);
        }
        else {
            ctx.reply('Error: Please try again');
            console.log('Sessions Failed (userRole/team)');
        }
    }
    else {
        if (userRole && team) {
            const userRoleList = await (await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                nameText: selectedName,
            }))
                .flatMap((n) => n.role)
                .flat()
                .concat(['SGL']);
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
            await ctx.reply(`${selectedName} added into ${team} Team`);
        }
        else {
            ctx.reply('Error: Please try again');
            console.log('Sessions Failed (userRole/team)');
        }
    }
    ctx.session = (0, _SessionData_1.initial)();
};
const delMember = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team !== 'Leaders') {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: [userRole, userRole + 'IC'] },
                },
            });
        }
        else {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: ['SGL', 'LGL'] },
                },
            });
        }
        const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
            {
                text: w.nameText,
                callback_data: `delMemberUser-${w.nameText}`,
            },
        ]));
        await ctx.reply(`Choose user to remove from ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
        ctx.session = (0, _SessionData_1.initial)();
    }
};
const delMember_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        const selectedName = await ctx.update.callback_query.data.substring('delMemberUser-'.length);
        let userRoleList = (await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
        if (team != 'Leaders') {
            if (userRoleList.includes(userRole)) {
                userRoleList.splice(userRoleList.indexOf(userRole, 1));
            }
            else if (userRoleList.includes(userRole + 'IC')) {
                userRoleList.splice(userRoleList.indexOf(userRole + 'IC', 1));
            }
            else {
                throw new Error('Invalid Role');
            }
        }
        else {
            if (userRoleList.includes('SGL')) {
                userRoleList.splice(userRoleList.indexOf('SGL', 1));
            }
            else if (userRoleList.includes('LGL')) {
                userRoleList.splice(userRoleList.indexOf('LGL', 1));
            }
            else {
                throw new Error('Invalid Role');
            }
        }
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
        await ctx.reply(`${selectedName} removed from ${team} Team`);
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
    ctx.session = (0, _SessionData_1.initial)();
};
const editMember = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team != 'Leaders') {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: [userRole, userRole + 'IC'] },
                },
            });
        }
        else {
            namelist = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: ['SGL', 'LGL'] },
                },
            });
        }
        const inlineKeyboard = new grammy_1.InlineKeyboard(namelist.map((w) => [
            {
                text: w.nameText,
                callback_data: `editMemberUser-${w.nameText}`,
            },
        ]));
        await ctx.reply(`Choose user to become IC/Member from ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
};
const editMember_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const selectedName = await ctx.update.callback_query.data.substring('editMemberUser-'.length);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let editRole = (await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
        let changeRole = '';
        if (team != 'Leaders') {
            if (editRole.includes(userRole)) {
                editRole.splice(editRole.indexOf(userRole, 1));
                changeRole = team + ' IC';
                editRole.push(userRole + 'IC');
            }
            else if (editRole.includes(userRole + 'IC')) {
                editRole.splice(editRole.indexOf(userRole + 'IC', 1));
                changeRole = team + ' Member';
                editRole.push(userRole);
            }
            else {
                throw new Error('Invalid Role');
            }
        }
        else {
            if (editRole.includes('SGL')) {
                editRole.splice(editRole.indexOf('SGL', 1));
                changeRole = 'LGL';
                editRole.push('LGL');
            }
            else if (editRole.includes('LGL')) {
                editRole.splice(editRole.indexOf('LGL', 1));
                changeRole = 'SGL';
                editRole.push('SGL');
            }
            else {
                throw new Error('Invalid Role');
            }
        }
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: editRole } });
        await ctx.reply(`${selectedName} changed to ${changeRole}`);
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
    ctx.session = (0, _SessionData_1.initial)();
};
