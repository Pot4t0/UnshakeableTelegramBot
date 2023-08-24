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
const _1 = require(".");
const botOnContext = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    switch (ctx.session.botOnType) {
        //Refer to finalWish Method in sendWishCallback.ts
        //Used for receiving wish msg
        case 1: {
            yield _1.sendWishCallback.FinalReply(ctx);
            break;
        }
        //Refer to sendSpecificReminder_4 in adminWelfareCallbacks.ts
        //Used for receiving reminders for specific reminder
        case 2: {
            yield _1.adminWelfareCallback.sendSpecificReminder_4(ctx);
            break;
        }
        //Refer to sendNotInReminder_3 in adminWelfareCallbacks.ts
        //Used for receiving reminders for all users that did not send in reminders
        case 3: {
            yield _1.adminWelfareCallback.sendNotInReminder_3(ctx);
            break;
        }
        case 4: {
            yield _1.adminWelfareCallback.addWelfareEvent_2(ctx);
            break;
        }
        case 5: {
            yield _1.adminWelfareCallback.addWelfareEvent_3(ctx);
            break;
        }
        case 6: {
            yield _1.adminWelfareCallback.editWelfareEventName_2(ctx);
            break;
        }
        case 7: {
            _1.adminWelfareCallback.editWelfareEventDate_2(ctx);
            break;
        }
        case 8: {
            yield _1.sendsfFunctions.sendSfEvent_2_yes(ctx);
            break;
        }
        case 9: {
            yield _1.sendsfFunctions.sendSfEvent_2_no(ctx);
            break;
        }
    }
});
exports.botOnContext = botOnContext;
