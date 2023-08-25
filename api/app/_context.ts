import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../models/_SessionData';

export type BotContext = Context & SessionFlavor<SessionData>;
