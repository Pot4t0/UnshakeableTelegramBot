import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../models/_SessionData';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';

export type BotContext = Context &
  ConversationFlavor &
  SessionFlavor<SessionData>;
export type BotConversation = Conversation<BotContext>;
