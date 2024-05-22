"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    gsheet: {
        attendance: process.env.ATTENDANCE_TOKEN || '',
        sf: process.env.SF_TOKEN || '',
        finance: process.env.FINANCE_TOKEN || '',
    },
};
exports.default = config;
