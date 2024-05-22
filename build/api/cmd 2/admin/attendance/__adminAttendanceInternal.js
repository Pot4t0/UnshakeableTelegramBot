"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventDBDoc = exports.adminAttendanceBotOn = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
/**
 * Admin Attendance BotOn Types Constant Class
 * - Used to store the BotOn types for the Admin Attendance Bot.
 * - Refer to BotOnHandler in _botOn_functions.ts
 */
class adminAttendanceBotOn {
}
exports.adminAttendanceBotOn = adminAttendanceBotOn;
/**
 * LG Event (WE Date)
 */
adminAttendanceBotOn.lgEventWEDate = 21;
/**
 * Create LG Event
 */
adminAttendanceBotOn.createLgEventBotOn = 22;
/**
 * No LG Event
 */
adminAttendanceBotOn.createNoLgEventBotOn = 23;
/**
 * SPL Event Date
 */
adminAttendanceBotOn.splEventDateBotOn = 24;
/**
 * Create SPL Event
 */
adminAttendanceBotOn.createSplEventBotOn = 25;
/**
 * Create Attendance Event Function
 * - Adds the event title and date to the database.
 * @param eventTitle The event title.
 * @param eventDate The event date.
 */
const createEventDBDoc = async (eventTitle, eventDate) => {
    const activeDoc = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Active',
    });
    if (activeDoc) {
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventTitle: activeDoc.eventTitle.concat(eventTitle) } });
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventDate: activeDoc.eventDate.concat(eventDate) } });
    }
};
exports.createEventDBDoc = createEventDBDoc;
