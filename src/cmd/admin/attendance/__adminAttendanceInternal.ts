import { Database } from '../../../database_mongoDB/_db-init';
import { Attendance_mongo } from '../../../database_mongoDB/Entity/_tableEntity';

export class adminAttendanceBotOn {
  static lgEventWEDate = 21;
  static createLgEventBotOn = 22;
  static createNoLgEventBotOn = 23;
  static splEventDateBotOn = 24;
  static createSplEventBotOn = 25;
}

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
