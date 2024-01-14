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
exports.sendMessageUser = void 0;
const _tableEntity_1 = require("../Entity/_tableEntity");
const _db_init_1 = require("../_db-init");
//Send to User in their respective ChatId with telegram bot
const sendMessageUser = (user, msg, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        teleUser: user,
    });
    const message = yield ctx.api.sendMessage(name[0].chat, msg, {
        parse_mode: 'HTML',
    });
    return message;
});
exports.sendMessageUser = sendMessageUser;
