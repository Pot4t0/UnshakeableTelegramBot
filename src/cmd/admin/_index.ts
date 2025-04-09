//For Admin Commands
import { Bot } from 'grammy';
import { BotContext } from '../../app/_context';
import { adminAttendance } from './attendance/_adminAttendanceCallbacks';
import { adminWelfare } from './_adminWelfareCallbacks';
import { adminBday } from './_adminBdayCallbacks';
import { adminSF } from './sf/_adminSFCallbacks';

//Admin Bot On Functions
export * as adminAttendanceBotOn from './attendance/_adminAttendanceBotOn';
export * as adminSFBotOn from './sf/_adminSFBotOn';

/**
 * admin Class (Callbacks)
 * - Collection of admin commands.
 * - This class contains all the admin commands.
 */
export class admin {
  /**
   * Admin Attendance command.
   * @param bot The Bot instance.
   */
  static attendance(bot: Bot<BotContext>) {
    adminAttendance(bot);
  }
  /**
   * Admin Welfare command.
   * @param bot The Bot instance.
   */
  static welfare(bot: Bot<BotContext>) {
    adminWelfare(bot);
  }
  /**
   * Admin Birthday command.
   * @param bot The Bot instance.
   */
  static bday(bot: Bot<BotContext>) {
    adminBday(bot);
  }
  /**
   * Admin SF command.
   * @param bot The Bot instance.
   */
  static sf(bot: Bot<BotContext>) {
    adminSF(bot);
  }
  /**
   * Admin Finance command.
   * @param bot The Bot instance.
   */
}
