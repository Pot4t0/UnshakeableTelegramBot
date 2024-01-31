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
const createEventDBDoc = (eventTitle, eventDate) => __awaiter(void 0, void 0, void 0, function* () {
    const activeDoc = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Active',
    });
    if (activeDoc) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventTitle: activeDoc.eventTitle.concat(eventTitle) } });
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventDate: activeDoc.eventDate.concat(eventDate) } });
    }
});
exports.createEventDBDoc = createEventDBDoc;
