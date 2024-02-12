"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventDBDoc = exports.adminAttendanceBotOn = void 0;
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
class adminAttendanceBotOn {
}
exports.adminAttendanceBotOn = adminAttendanceBotOn;
adminAttendanceBotOn.lgEventWEDate = 21;
adminAttendanceBotOn.createLgEventBotOn = 22;
adminAttendanceBotOn.createNoLgEventBotOn = 23;
adminAttendanceBotOn.splEventDateBotOn = 24;
adminAttendanceBotOn.createSplEventBotOn = 25;
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
