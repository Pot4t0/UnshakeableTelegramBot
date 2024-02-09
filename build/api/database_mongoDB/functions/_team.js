"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamManagement = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const _telefunctions_1 = require("../../app/_telefunctions");
const teamManagement = (bot, team
//   |'Attendance'
) => __awaiter(void 0, void 0, void 0, function* () {
    let userRole;
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
    bot.callbackQuery(`manage${team}Team`, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield teamManagementMenu(ctx, team, userRole);
    }));
    bot.callbackQuery(`addMember`, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield addMember(ctx);
    }));
    bot.callbackQuery(/^addMemberUser-/g, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield addMember_Execution(ctx);
    }));
    bot.callbackQuery(`delMember`, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield delMember(ctx);
    }));
    bot.callbackQuery(/^delMemberUser-/g, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield delMember_Execution(ctx);
    }));
    bot.callbackQuery(`editMember`, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield editMember(ctx);
    }));
    bot.callbackQuery(/^editMemberUser-/g, _telefunctions_1.loadFunction, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield editMember_Execution(ctx);
    }));
});
exports.teamManagement = teamManagement;
const teamManagementMenu = (ctx, team, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    let icText = 'Make User be IC/Member';
    if (userRole === 'leaders') {
        icText = 'Make User be SGL/LGL';
    }
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
        const userList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: [userRole] },
            },
        });
        const icList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: [userRole + 'IC'] },
            },
        });
        yield ctx.reply(`<b>${team} Team</b>\n\nIC:\n${icList
            .map((n) => n.nameText)
            .join('\n')}\n\nMembers:\n${userList
            .map((n) => n.nameText)
            .join('\n')}`, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
        });
    }
    else {
        const userList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: ['SGL'] },
            },
        });
        const icList = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                role: { $in: ['LGL'] },
            },
        });
        yield ctx.reply(`<b>${team} Team</b>\n\nLGL:\n${icList
            .map((n) => n.nameText)
            .join('\n')}\n\nSGL:\n${userList.map((n) => n.nameText).join('\n')}`, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
        });
    }
});
const addMember = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team != 'Leaders') {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $not: { $in: [userRole, userRole + 'IC'] } },
                },
            });
        }
        else {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
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
        yield ctx.reply(`Choose user to add into ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
});
const addMember_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const selectedName = yield ctx.update.callback_query.data.substring('addMemberUser-'.length);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (team != 'Leaders') {
        if (userRole && team) {
            const userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                nameText: selectedName,
            }))
                .flatMap((n) => n.role)
                .flat()
                .concat([userRole]);
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
            yield ctx.reply(`${selectedName} added into ${team} Team`);
        }
        else {
            ctx.reply('Error: Please try again');
            console.log('Sessions Failed (userRole/team)');
        }
    }
    else {
        if (userRole && team) {
            const userRoleList = yield (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                nameText: selectedName,
            }))
                .flatMap((n) => n.role)
                .flat()
                .concat(['SGL']);
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
            yield ctx.reply(`${selectedName} added into ${team} Team`);
        }
        else {
            ctx.reply('Error: Please try again');
            console.log('Sessions Failed (userRole/team)');
        }
    }
    ctx.session = (0, _SessionData_1.initial)();
});
const delMember = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team !== 'Leaders') {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: [userRole, userRole + 'IC'] },
                },
            });
        }
        else {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
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
        yield ctx.reply(`Choose user to remove from ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
        ctx.session = (0, _SessionData_1.initial)();
    }
});
const delMember_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        const selectedName = yield ctx.update.callback_query.data.substring('delMemberUser-'.length);
        let userRoleList = (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
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
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: userRoleList } });
        yield ctx.reply(`${selectedName} removed from ${team} Team`);
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
    ctx.session = (0, _SessionData_1.initial)();
});
const editMember = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let namelist;
        if (team != 'Leaders') {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                where: {
                    role: { $in: [userRole, userRole + 'IC'] },
                },
            });
        }
        else {
            namelist = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
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
        yield ctx.reply(`Choose user to become IC/Member from ${team} team`, {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
});
const editMember_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const selectedName = yield ctx.update.callback_query.data.substring('editMemberUser-'.length);
    const userRole = ctx.session.userRole;
    const team = ctx.session.team;
    if (userRole && team) {
        let editRole = (yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({ nameText: selectedName })).flatMap((n) => n.role);
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
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: selectedName }, { $set: { role: editRole } });
        yield ctx.reply(`${selectedName} changed to ${changeRole}`);
    }
    else {
        ctx.reply('Error: Please try again');
        console.log('Sessions Failed (userRole/team)');
    }
    ctx.session = (0, _SessionData_1.initial)();
});
