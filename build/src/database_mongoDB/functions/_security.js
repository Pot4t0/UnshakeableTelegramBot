"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserInDatabaseMiddleware = exports.roleAccess = void 0;
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
/**
 * Check if user has access to the function (Welfare, Bday, etc)
 * @param role The role to check for access.
 * @param ctx The context object.
 * @returns Whether the user has access to the function.
 */
const roleAccess = async (role, ctx) => {
    var _a;
    let teleUserList = [];
    let access;
    for (let i = 0; i < role.length; i++) {
        access = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            role: role[i],
        });
        teleUserList.push(access.map((x) => x.teleUser.toString()));
    }
    teleUserList = teleUserList.flat();
    const user = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.username) || 'FAIL';
    return teleUserList.includes(user);
};
exports.roleAccess = roleAccess;
/**
 * Check if user is in the database
 * Lock Out Middleware Function
 * @param ctx The context object.
 * @param next The next middleware function.
 * @returns The next middleware function or command function.
 * @throws Error if user is not in the database.
 */
const checkUserInDatabaseMiddleware = async (ctx, next) => {
    var _a;
    const currentUser = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.username) || 'FAIL';
    const userExists = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: currentUser,
    });
    if (userExists && userExists.length > 0) {
        await next(); // User is in the database, proceed to the next middleware or command function
    }
    else {
        await ctx.reply('You are not authorized to use this command. Please contact your IT representative for assistance.');
    }
};
exports.checkUserInDatabaseMiddleware = checkUserInDatabaseMiddleware;
