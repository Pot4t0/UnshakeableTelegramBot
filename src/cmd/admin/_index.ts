//For Admin Commands
import { Bot } from 'grammy';
import { BotContext } from '../../app/_context';
import { adminAttendance } from './attendance/_adminAttendanceCallbacks';
import { adminWelfare } from './_adminWelfareCallbacks';
import { adminBday } from './_adminBdayCallbacks';
import { adminSF } from './sf/_adminSFCallbacks';
import { adminFinance } from './finance/_financeCallbacks';

//Admin Bot On Functions
export * as adminAttendanceBotOn from './attendance/_adminAttendanceBotOn';
export * as adminSFBotOn from './sf/_adminSFBotOn';
export * as adminFinanceBotOn from './finance/_financeBotOn';

//Admin Callback Functions
export class admin {
  static attendance(bot: Bot<BotContext>) {
    adminAttendance(bot);
  }
  static welfare(bot: Bot<BotContext>) {
    adminWelfare(bot);
  }
  static bday(bot: Bot<BotContext>) {
    adminBday(bot);
  }
  static sf(bot: Bot<BotContext>) {
    adminSF(bot);
  }
  static finance(bot: Bot<BotContext>) {
    adminFinance(bot);
  }
}
