import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Settings } from 'luxon';
import { ObjectId } from 'typeorm';

export interface SessionData {
  id?: ObjectId;
  chatId?: number;
  team?: 'Attendance' | 'Welfare' | 'Admin' | 'Birthday';
  userRole?: 'attendance' | 'welfare' | 'admin' | 'bday';
  attendance?: string;
  eventName?: string;
  eventDate?: string;
  name?: string;
  wish?: string;
  reminderUser?: string;
  botOnType?: number;
  text?: string;
  eventMeal?: string;
  gSheet?: GoogleSpreadsheetWorksheet;
  scheduler?: Settings;
}
export function initial(): SessionData {
  return {
    id: undefined,
    chatId: undefined,
    attendance: undefined,
    eventName: undefined,
    eventDate: undefined,
    name: undefined,
    wish: undefined,
    reminderUser: undefined,
    botOnType: undefined,
    text: undefined,
    eventMeal: undefined,
    gSheet: undefined,
    scheduler: undefined,
  };
}
