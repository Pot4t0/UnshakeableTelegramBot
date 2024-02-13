"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.Database = void 0;
require("reflect-metadata");
require("dotenv/config");
const typeorm_1 = require("typeorm");
const _tableEntity_1 = require("./Entity/_tableEntity");
exports.Database = new typeorm_1.DataSource({
    type: 'mongodb',
    url: process.env.CONNECTION || '',
    database: 'UnshakeableDB',
    entities: [
        _tableEntity_1.Names,
        _tableEntity_1.Events,
        _tableEntity_1.Wishes,
        _tableEntity_1.SF_mongo,
        _tableEntity_1.Attendance_mongo,
        _tableEntity_1.Settings,
        _tableEntity_1.Claims,
    ],
});
const init = async () => {
    await exports.Database.initialize()
        .then(() => {
        console.log('Data Source has been initialized!');
    })
        .then(() => {
        const promiseLG = exports.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'LG',
        });
        const promiseGsheet = exports.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'gsheet',
        });
        promiseLG
            .then((res) => {
            const lgChat = res === null || res === void 0 ? void 0 : res.config[0];
            const lgFinanceClaim = res === null || res === void 0 ? void 0 : res.config[1];
            const lgFinancePassword = res === null || res === void 0 ? void 0 : res.config[2];
            process.env.LG_CHATID = lgChat;
            process.env.LG_FINANCE_CLAIM = lgFinanceClaim;
            process.env.FINANCE_PASSWORD = lgFinancePassword;
            console.log('LG details updated');
        })
            .catch((err) => {
            console.log('Error could not get LG env variables', err);
        });
        promiseGsheet
            .then((res) => {
            const attendance = res === null || res === void 0 ? void 0 : res.config[0];
            const sf = res === null || res === void 0 ? void 0 : res.config[1];
            const finance = res === null || res === void 0 ? void 0 : res.config[2];
            process.env.ATTENDANCE_TOKEN = attendance;
            process.env.SF_TOKEN = sf;
            process.env.FINANCE_TOKEN = finance;
            console.log('Gsheet details updated');
        })
            .catch((err) => {
            console.log('Error could not get gsheet env variables', err);
        });
    })
        .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
};
exports.init = init;
