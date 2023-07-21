import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../models/SessionData';

export type BotContext = Context & SessionFlavor<SessionData>;

type Database = Record<string, Array<Record<string, any>>>;

const db = {
  events: {
    id: {
      event: 'ORC',
      persons: ['p1', 'p2'],
    },
    abbd: {},
  },
  persons: {
    id: {
      name: '',
      events: ['id1', 'id2'],
    },
  },
};
