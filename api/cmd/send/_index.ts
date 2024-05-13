import { Bot } from 'grammy';
import { BotContext } from '../../app/_context';
import { sendAttendance } from './attendance/_sendAttendanceCallbacks';
import { sendsf } from './sf/_sendSFCallback';
import { sendWish } from './wish/_sendWishCallback';
import { sendClaim } from './claim/_claimCallbacks';

//Send Bot On Functions
export * as sendAttendanceBotOn from './attendance/_sendAttendanceBotOn';
export * as sendsfBotOn from './sf/_sendSFBotOn';
export * as sendWishBotOn from './wish/_sendWishBotOn';
export * as sendClaimBotOn from './claim/_claimBotOn';

/**
 * send Class (Callbacks)
 * - Collection of send commands.
 */
export class send {
  /**
   * Sends attendance command.
   * @param bot The Bot instance.
   */
  static attendance(bot: Bot<BotContext>) {
    sendAttendance(bot);
  }
  /**
   * Sends wish command.
   * @param bot The Bot instance.
   */
  static wish(bot: Bot<BotContext>) {
    sendWish(bot);
  }
  /**
   * Sends sf command.
   * @param bot The Bot instance.
   */
  static sf(bot: Bot<BotContext>) {
    sendsf(bot);
  }
  /**
   * Sends claim command.
   * @param bot The Bot instance.
   */
  static claim(bot: Bot<BotContext>) {
    sendClaim(bot);
  }
}
