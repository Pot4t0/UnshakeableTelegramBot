import { google } from 'googleapis';
import fs from 'fs';

const credentials = require('./path/to/service-account-file.json');

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
  version: 'v3',
  auth: auth,
});
