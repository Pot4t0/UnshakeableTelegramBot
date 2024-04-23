"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initial = void 0;
/**
 * Initializes a new session data object with default values.
 * @returns {SessionData} The initialized session data object.
 */
function initial() {
    return {
        id: undefined,
        chatId: undefined,
        amount: undefined,
        attendance: undefined,
        eventName: undefined,
        eventDate: undefined,
        claimId: undefined,
        name: undefined,
        wish: undefined,
        reminderUser: undefined,
        botOnType: undefined,
        text: undefined,
        eventMeal: undefined,
        gSheet: undefined,
        scheduler: undefined,
        botOnPhoto: undefined,
    };
}
exports.initial = initial;
