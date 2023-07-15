"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mariadb_1 = __importDefault(require("mariadb"));
// Expose the Pool object within this module
exports.default = {
    pool: mariadb_1.default.createPool({
        host: 'pi',
        port: 3306,
        user: 'user',
        password: 'Password123!',
        database: 'unshakeableDB',
    }),
};
