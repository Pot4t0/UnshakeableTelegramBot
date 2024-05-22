"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const credentials = require('./path/to/service-account-file.json');
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = googleapis_1.google.drive({
    version: 'v3',
    auth: auth,
});
