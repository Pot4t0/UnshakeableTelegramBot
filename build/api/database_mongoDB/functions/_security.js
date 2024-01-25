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
exports.checkUserInDatabaseMiddleware = exports.roleAccess = void 0;
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
//Creates security access for any function (Welfare, Bday, etc)
const roleAccess = (role, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let teleUserList = [];
    let access;
    for (let i = 0; i < role.length; i++) {
        access = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            role: role[i],
        });
        teleUserList.push(access.map((x) => x.teleUser.toString()));
    }
    teleUserList = teleUserList.flat();
    const user = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.username) || 'FAIL';
    return teleUserList.includes(user);
});
exports.roleAccess = roleAccess;
//Lock Out Middleware Function
const checkUserInDatabaseMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const currentUser = ((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.from.username) || 'FAIL';
    const userExists = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: currentUser,
    });
    if (userExists) {
        yield next(); // User is in the database, proceed to the next middleware or command function
    }
    else {
        yield ctx.reply('You are not authorized to use this command. Please contact your IT representative for assistance.');
    }
});
exports.checkUserInDatabaseMiddleware = checkUserInDatabaseMiddleware;
