"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botOnContext = void 0;
const _index_1 = require("./_index");
const botOnContext = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    switch (ctx.session.botOnType) {
        // /sendwish BotOn Functions
        //Refer to finalWish Method in sendWishCallback.ts
        //Used for receiving wish msg
        case 1: {
            yield _index_1.sendWishCallback.FinalReply(ctx);
            break;
        }
        // /adminwelfare BotOn Functions
        //Used for receiving reminders for specific reminder
        case 2: {
            yield _index_1.adminWelfareCallback.sendSpecificReminder_4(ctx);
            break;
        }
        //Used for receiving reminders for all users that did not send in reminders
        case 3: {
            yield _index_1.adminWelfareCallback.sendNotInReminder_3(ctx);
            break;
        }
        //Used for adding welfare events (Event Name)
        case 4: {
            yield _index_1.adminWelfareCallback.addWelfareEvent_2(ctx);
            break;
        }
        //Used for adding welfare events (Event Date)
        case 5: {
            yield _index_1.adminWelfareCallback.addWelfareEvent_3(ctx);
            break;
        }
        //Used for editing welfare events (Event Name)
        case 6: {
            yield _index_1.adminWelfareCallback.editWelfareEventName_2(ctx);
            break;
        }
        //Used for editing welfare events (Event Dtae)
        case 7: {
            _index_1.adminWelfareCallback.editWelfareEventDate_2(ctx);
            break;
        }
        // /sendSF BotOn Functions
        //Used for receiving sf msg
        case 8: {
            yield _index_1.sendsfFunctions.sendSfEvent_2_yes(ctx);
            break;
        }
        //Used for receiving reason msg
        case 9: {
            yield _index_1.sendsfFunctions.sendSfEvent_2_no(ctx);
            break;
        }
        // /adminbday BotOn Functions
        case 10: {
            yield _index_1.adminbdayCallback.sendNotInReminder_3(ctx);
            break;
        }
        case 11: {
            yield _index_1.adminWelfareCallback.sendSpecificReminder_4(ctx);
            break;
        }
        case 12: {
            yield _index_1.adminbdayCallback.addBdayEvent_2(ctx);
            break;
        }
        case 13: {
            yield _index_1.adminbdayCallback.addBdayEvent_3(ctx);
            break;
        }
        case 14: {
            yield _index_1.adminbdayCallback.editEventName_2(ctx);
            break;
        }
        case 15: {
            yield _index_1.adminbdayCallback.editEventDate_2(ctx);
            break;
        }
        // /adminsf BotOn Functions
        case 16: {
            yield _index_1.adminSFCallback.sendNotInReminder_2(ctx);
            break;
        }
        case 17: {
            yield _index_1.adminSFCallback.sendNotInReminder_3(ctx);
            break;
        }
        case 18: {
            yield _index_1.adminSFCallback.sendSpecificReminder_3(ctx);
            break;
        }
        // sendattendance BotOn Functions
        case 19: {
            yield _index_1.sendAttendanceCallback.noLG_no_2(ctx);
            break;
        }
        case 20: {
            yield _index_1.sendAttendanceCallback.withLG_noLG_2(ctx);
            break;
        }
        // /adminattendance
        case 21: {
            yield _index_1.adminAttendanceCallback.addAttendanceSheet_Yes_2(ctx);
            break;
        }
        case 22: {
            yield _index_1.adminAttendanceCallback.addAttendanceSheet_Yes_3(ctx);
            break;
        }
        //Add without LG
        case 23: {
            yield _index_1.adminAttendanceCallback.addAttendanceSheet_No_2(ctx);
            break;
        }
        //reminders
        case 24: {
            yield _index_1.adminAttendanceCallback.sendNotInReminder_2(ctx);
            break;
        }
        case 25: {
            yield _index_1.adminAttendanceCallback.sendSpecificReminder_3(ctx);
            break;
        }
        //Add special sheet
        case 26: {
            yield _index_1.adminAttendanceCallback.specialAddAttendance_2(ctx);
            break;
        }
        case 27: {
            yield _index_1.adminAttendanceCallback.specialAddAttendance_3(ctx);
            break;
        }
        // /sendattendance Special Event
        case 28: {
            yield _index_1.sendAttendanceCallback.noSpecialAttendance_2(ctx);
            break;
        }
        case 29: {
            yield _index_1.sendAttendanceCallback.dinnerAttendanceReason(ctx);
            break;
        }
        case 30: {
            yield _index_1.adminSFCallback.manualSFNo(ctx);
            break;
        }
        case 31: {
            yield _index_1.settingsCallbackx.settingsAnnouncements_Output(ctx);
            break;
        }
    }
});
exports.botOnContext = botOnContext;
