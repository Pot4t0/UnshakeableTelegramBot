"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const googleapis_1 = require("googleapis");
exports.auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.DRIVE_EMAIL,
        private_key: process.env.DRIVEKEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
});
