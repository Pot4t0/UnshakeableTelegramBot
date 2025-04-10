import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Settings } from 'luxon';
import { ObjectId } from 'typeorm';

/**
 * Interface representing session data.
 */
export interface SessionData {
  /**
   * The unique identifier of the session.
   * @type {ObjectId}
   * @memberof SessionData
   * @default undefined
   * @example ObjectId('60f4b3b3b3b3b3b3b3b3b3b3')
   */
  id?: ObjectId;
  /**
   * The user's access to the finance Google Sheet.
   * @type {boolean}
   * @memberof SessionData
   * @default undefined
   * @example true
   */
  financeAccess?: boolean;
  /**
   * The unique identifier of the chat.
   * @type {number}
   * @memberof SessionData
   * @default undefined
   * @example 1234567890
   */
  chatId?: number;
  /**
   * The amount to be claimed.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example '10.00'
   */
  amount?: string;
  /**
   * The unique identifier of the claim using uuid.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example '60f4b3b3b3b3b3b3b3b3b3b3'
   */
  claimId?: string;
  /**
   * The team the user belongs to.
   * @type {'Attendance' | 'Welfare' | 'Admin' | 'Birthday' | 'Leaders' | 'Finance'}
   * @memberof SessionData
   * @default undefined
   * @example 'Attendance'
   */
  team?:
    | 'Attendance'
    | 'Welfare'
    | 'Admin'
    | 'Birthday'
    | 'Leaders'
    | 'Finance';
  /**
   * The user's role in the team.
   * @type {'attendance' | 'welfare' | 'admin' | 'bday' | 'leaders' | 'finance'}
   * @memberof SessionData
   * @default undefined
   * @example 'attendance'
   */
  userRole?:
    | 'attendance'
    | 'welfare'
    | 'admin'
    | 'bday'
    | 'leaders'
    | 'finance';
  /**
   * The user's attendance status.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'Y'
   */
  attendance?: string;
  /**
   * The name of the event.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'Revival Night'
   */
  eventName?: string;
  /**
   * The date of the event.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example '20/07/2021'
   */
  eventDate?: string;
  /**
   * The user's name.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'John Doe'
   */
  name?: string;
  /**
   * The user's birthday wish.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'Happy Birthday!'
   */
  wish?: string;
  /**
   * The user to remind.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example '@Pot4t0'
   */
  reminderUser?: string;
  /**
   * The bot on type.
   * - Used for msg handling.
   * @type {number}
   * @memberof SessionData
   * @default undefined
   * @example 11
   */
  botOnType?: number;
  /**
   * The bot on function.
   * - Used for msg handling.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'functionName'
   */
  botOnFunction?: string;

  /**
   * Any text to be stored.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'Hello World!'
   */
  text?: string;
  /**
   * The meal for the event.
   * @type {string}
   * @memberof SessionData
   * @default undefined
   * @example 'Dinner'
   */
  eventMeal?: string;
  /**
   * The Google Sheet.
   * @type {GoogleSpreadsheetWorksheet}
   * @memberof SessionData
   * @default undefined
   * @example GoogleSpreadsheetWorksheet
   */
  gSheet?: GoogleSpreadsheetWorksheet;
  /**
   * The scheduler settings.
   * @type {Settings}
   * @memberof SessionData
   * @default undefined
   * @example Settings
   */
  scheduler?: Settings;
  /**
   * The bot on photo.
   * @type {number}
   * @memberof SessionData
   * @default undefined
   * @example 1
   */
  botOnPhoto?: number;
}

/**
 * Initializes a new session data object with default values.
 * @returns {SessionData} The initialized session data object.
 */
export function initial(): SessionData {
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
    botOnFunction: undefined,
    text: undefined,
    eventMeal: undefined,
    gSheet: undefined,
    scheduler: undefined,
    botOnPhoto: undefined,
  };
}
