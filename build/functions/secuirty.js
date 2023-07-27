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
exports.roleAccess = void 0;
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const db_init_1 = require("../database_mongoDB/db-init");
//Creates security access for teams (Welfare, Bday, etc)
const roleAccess = (team, ic, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const team_db = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
        role: team,
    });
    const ic_db = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
        role: ic,
    });
    let teamArray = team_db.map((n) => n.teleUser);
    teamArray.push(ic_db.map((n) => n.teleUser).toString());
    const user = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.username) || 'FAIL';
    return teamArray.includes(user);
});
exports.roleAccess = roleAccess;
