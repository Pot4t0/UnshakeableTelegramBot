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
export //Send Callbacks Functions
class send {
  static attendance(bot: Bot<BotContext>) {
    sendAttendance(bot);
  }
  static wish(bot: Bot<BotContext>) {
    sendWish(bot);
  }
  static sf(bot: Bot<BotContext>) {
    sendsf(bot);
  }
  static claim(bot: Bot<BotContext>) {
    sendClaim(bot);
  }
}
