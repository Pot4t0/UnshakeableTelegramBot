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
exports.Database = void 0;
require("reflect-metadata");
require("dotenv/config");
const typeorm_1 = require("typeorm");
const _tableEntity_1 = require("./Entity/_tableEntity");
exports.Database = new typeorm_1.DataSource({
    type: 'mongodb',
    url: process.env.CONNECTION || '',
    database: 'UnshakeableDB',
    entities: [_tableEntity_1.Names, _tableEntity_1.Events, _tableEntity_1.Wishes, _tableEntity_1.SF_mongo, _tableEntity_1.Attendance_mongo, _tableEntity_1.Settings],
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.Database.initialize()
        .then(() => {
        console.log('Data Source has been initialized!');
    })
        .then(() => {
        const promiseLG = exports.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'LG',
        });
        promiseLG
            .then((res) => {
            const lgChat = res === null || res === void 0 ? void 0 : res.config[0];
            process.env.LG_CHATID = lgChat;
            console.log('LG Chat ID updated');
        })
            .catch((err) => {
            console.log('Error could not get LG Chat ID', err);
        });
    })
        .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
});
init();
