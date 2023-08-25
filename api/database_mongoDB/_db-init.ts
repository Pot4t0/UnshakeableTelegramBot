import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import { Events, Names, Wishes } from './Entity/_tableEntity';
export const Database = new DataSource({
  type: 'mongodb',
  url: process.env.CONNECTION || '',
  database: 'UnshakeableDB',
  entities: [Names, Events, Wishes],
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
