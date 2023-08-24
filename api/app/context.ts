import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../models/SessionData';

export type BotContext = Context & SessionFlavor<SessionData>;
