import { Api, Context, SessionFlavor } from 'grammy';
import { SessionData } from '../models/_SessionData';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { FileApiFlavor, FileFlavor } from '@grammyjs/files';

export type BotContext = Context &
  ConversationFlavor &
  SessionFlavor<SessionData> &
  FileFlavor<Context> &
  FileApiFlavor<Api>;
export type BotConversation = Conversation<BotContext>;
