import { google } from 'googleapis';
export const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.DRIVE_EMAIL!,
    private_key: process.env.DRIVEKEY!,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});
