import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import {
  Attendance_mongo,
  Events,
  Names,
  SF_mongo,
  Settings,
  Wishes,
} from './Entity/_tableEntity';
export const Database = new DataSource({
  type: 'mongodb',
  url: process.env.CONNECTION || '',
  database: 'UnshakeableDB',
  entities: [Names, Events, Wishes, SF_mongo, Attendance_mongo, Settings],
});

const init = async () => {
  await Database.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .then(() => {
      const promiseLG = Database.getMongoRepository(Settings).findOneBy({
        option: 'LG',
      });
      promiseLG
        .then((res) => {
          const lgChat = res?.config[0];
          process.env.LG_CHATID = lgChat;
          console.log('LG Chat ID updated');
        })
        .catch((err) => {
          console.log('Error could not get LG Chat ID', err);
        });
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });
};
init();
