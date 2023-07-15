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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const db_init_1 = __importDefault(require("./db-init"));
class Query {
    constructor() {
        this.select = (table, column) => __awaiter(this, void 0, void 0, function* () {
            let list = [];
            try {
                // Use pool.query to get all contacts
                let rows = yield db_init_1.default.query('SELECT ' + column + ' FROM ' + table);
                // Print list of contacts
                for (let i = 0, len = rows.length; i < len; i++) {
                    list[i] = rows[i][column];
                }
            }
            catch (err) {
                // Print errors
                console.log(err);
            }
            return list;
        });
        /**
         *
         * @param {string} table
         * @param {string[]} valueHeader
         * @param {string[]} value
         * @returns {Promise<bigint>} sequence number
         */
        this.insert = (table, valueHeader, value) => {
            return db_init_1.default.query(`INSERT INTO ${table} (${valueHeader.join(',')}) VALUES ("${value.join('","')}")`);
        };
    }
}
exports.query = new Query();
