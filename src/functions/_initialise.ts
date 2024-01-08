import 'reflect-metadata';
import 'dotenv/config';
import { Bot, session } from 'grammy';
import { BotContext } from '../app/_index';
import { initial } from '../models/_SessionData';
import { conversations } from '@grammyjs/conversations';

//Initilaise Telegram Bot
export const init_bot = () => {
  const token = process.env.BOT_TOKEN || '';
  const bot = new Bot<BotContext>(token);
  if (!token) throw new Error('BOT_TOKEN is unset');
  bot.use(session({ initial }));
  bot.use(conversations());

  return bot;
};
