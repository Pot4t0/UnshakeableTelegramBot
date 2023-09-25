"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance_mongo = exports.SF_mongo = exports.Wishes = exports.Names = exports.Events = void 0;
const typeorm_1 = require("typeorm");
//Declaring all collections within UnshakeableDB
//events Collection
let Events = class Events {
};
exports.Events = Events;
__decorate([
    (0, typeorm_1.ObjectIdColumn)(),
    __metadata("design:type", typeorm_1.ObjectId)
], Events.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Events.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Events.prototype, "eventTeam", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Events.prototype, "eventDate", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Array)
], Events.prototype, "assignment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Events.prototype, "notAllowedUser", void 0);
exports.Events = Events = __decorate([
    (0, typeorm_1.Entity)('events')
], Events);
// names collection
let Names = class Names {
};
exports.Names = Names;
__decorate([
    (0, typeorm_1.ObjectIdColumn)(),
    __metadata("design:type", typeorm_1.ObjectId)
], Names.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Names.prototype, "nameText", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Names.prototype, "teleUser", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Names.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Names.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Names.prototype, "sfrow", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Names.prototype, "attendanceRow", void 0);
exports.Names = Names = __decorate([
    (0, typeorm_1.Entity)('names')
], Names);
// wishes Collaction
let Wishes = class Wishes {
};
exports.Wishes = Wishes;
__decorate([
    (0, typeorm_1.ObjectIdColumn)(),
    __metadata("design:type", typeorm_1.ObjectId)
], Wishes.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Wishes.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Wishes.prototype, "teleUser", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Wishes.prototype, "wishText", void 0);
exports.Wishes = Wishes = __decorate([
    (0, typeorm_1.Entity)('wishes')
], Wishes);
let SF_mongo = class SF_mongo {
};
exports.SF_mongo = SF_mongo;
__decorate([
    (0, typeorm_1.ObjectIdColumn)(),
    __metadata("design:type", typeorm_1.ObjectId)
], SF_mongo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SF_mongo.prototype, "teleUser", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SF_mongo.prototype, "sf", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], SF_mongo.prototype, "attendance", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SF_mongo.prototype, "timestamp", void 0);
exports.SF_mongo = SF_mongo = __decorate([
    (0, typeorm_1.Entity)('sf')
], SF_mongo);
let Attendance_mongo = class Attendance_mongo {
};
exports.Attendance_mongo = Attendance_mongo;
__decorate([
    (0, typeorm_1.ObjectIdColumn)(),
    __metadata("design:type", typeorm_1.ObjectId)
], Attendance_mongo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attendance_mongo.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attendance_mongo.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Object)
], Attendance_mongo.prototype, "response", void 0);
exports.Attendance_mongo = Attendance_mongo = __decorate([
    (0, typeorm_1.Entity)('attendance')
], Attendance_mongo);
// attendance collection
// @Entity('attendance')
// export class Attendance {
//   @ObjectIdColumn()
//   id: ObjectId;
//   @Column()
//   rowNo: number;
//   @Column()
//   name: string;
// }
