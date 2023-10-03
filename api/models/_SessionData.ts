import { ObjectId } from 'typeorm';

export interface SessionData {
  id?: ObjectId;
  attendance?: string;
  eventName?: string;
  eventDate?: string;
  name?: string;
  wish?: string;
  reminderUser?: string;
  botOnType?: number;
  text?: string;
  weAttendance?: string;
  weReason?: string;
}
export function initial(): SessionData {
  return {
    id: undefined,
    attendance: undefined,
    eventName: undefined,
    eventDate: undefined,
    name: undefined,
    wish: undefined,
    reminderUser: undefined,
    botOnType: undefined,
    text: undefined,
    weAttendance: undefined,
    weReason: undefined,
  };
}
