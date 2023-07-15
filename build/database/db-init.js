"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mariadb_1 = require("mariadb");
// Expose the Pool object within this module
exports.default = (0, mariadb_1.createPool)({
    host: 'pi',
    port: 3306,
    user: 'user',
    password: 'Password123!',
    database: 'unshakeableDB',
});
