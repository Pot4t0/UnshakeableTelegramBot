import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import {
  Attendance_mongo,
  Claims,
  Events,
  Names,
  SF_mongo,
  Settings,
  Wishes,
} from './Entity/_tableEntity';

/**
 * Represents the MongoDB database.
 */
export const Database = new DataSource({
  type: 'mongodb',
  url: process.env.CONNECTION || '',
  database: 'UnshakeableDB',
  entities: [
    Names,
    Events,
    Wishes,
    SF_mongo,
    Attendance_mongo,
    Settings,
    Claims,
  ],
});

/**
 * Initialises the MongoDB database.
 */
export const init = async () => {
  await Database.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .then(() => {
      const promiseLG = Database.getMongoRepository(Settings).findOneBy({
        option: 'LG',
      });
      const promiseGsheet = Database.getMongoRepository(Settings).findOneBy({
        option: 'gsheet',
      });

      promiseLG
        .then((res) => {
          const lgChat = res?.config[0];
          const lgFinanceFolder = res?.config[1];
          const lgFinancePassword = res?.config[2];
          process.env.LG_CHATID = lgChat;
          process.env.FINANCE_FOLDER_ID = lgFinanceFolder;
          process.env.FINANCE_PASSWORD = lgFinancePassword;
          console.log('LG details updated');
        })
        .catch((err) => {
          console.log('Error could not get LG env variables', err);
        });

      promiseGsheet
        .then((res) => {
          const attendance = res?.config[0];
          const sf = res?.config[1];
          const finance = res?.config[2];
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
