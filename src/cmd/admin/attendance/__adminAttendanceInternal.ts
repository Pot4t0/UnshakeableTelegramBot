import { Database } from '../../../database_mongoDB/_db-init';
import { Attendance_mongo } from '../../../database_mongoDB/Entity/_tableEntity';

/**
 * Admin Attendance BotOn Types Constant Class
 * - Used to store the BotOn types for the Admin Attendance Bot.
 * - Refer to BotOnHandler in _botOn_functions.ts
 */
export class adminAttendanceBotOn {
  /**
   * LG Event (WE Date)
   */
  static lgEventWEDate = 21;
  /**
   * Create LG Event
   */
  static createLgEventBotOn = 22;
  /**
   * No LG Event
   */
  static createNoLgEventBotOn = 23;
  /**
   * SPL Event Date
   */
  static splEventDateBotOn = 24;
  /**
   * Create SPL Event
   */
  static createSplEventBotOn = 25;
}

/**
 * Create Attendance Event Function
 * - Adds the event title and date to the database.
 * @param eventTitle The event title.
 * @param eventDate The event date.
 */
export const createEventDBDoc = async (
  eventTitle: string,
  eventDate: string
) => {
  const activeDoc = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Active',
  });

  if (activeDoc) {
    await Database.getMongoRepository(Attendance_mongo).updateOne(
      { name: 'Active' },
      { $set: { eventTitle: activeDoc.eventTitle.concat(eventTitle) } }
    );
    await Database.getMongoRepository(Attendance_mongo).updateOne(
      { name: 'Active' },
      { $set: { eventDate: activeDoc.eventDate.concat(eventDate) } }
    );
  }
};
