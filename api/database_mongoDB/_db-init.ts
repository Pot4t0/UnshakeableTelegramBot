import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import {
  Attendance_mongo,
  Events,
  Names,
  SF_mongo,
  Wishes,
} from './Entity/_tableEntity';
export const Database = new DataSource({
  type: 'mongodb',
  url: process.env.CONNECTION || '',
  database: 'UnshakeableDB',
  entities: [Names, Events, Wishes, SF_mongo, Attendance_mongo],
});

const init = async () => {
  await Database.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });
};
init();
