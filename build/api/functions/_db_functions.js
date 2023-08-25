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
exports.sendMessageUser = exports.roleAccess = void 0;
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_init_1 = require("../database_mongoDB/_db-init");
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
//Send to User in their respective ChatId with telegram bot
const sendMessageUser = (user, msg, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: user,
    });
    if (name[0].chat) {
        ctx.api.sendMessage(name[0].chat, msg);
    }
});
exports.sendMessageUser = sendMessageUser;
