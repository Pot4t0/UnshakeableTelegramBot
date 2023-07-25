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
exports.Event = exports.Assignment = exports.Person = exports.WishTable = exports.NameTable = exports.EventTable = void 0;
const typeorm_1 = require("typeorm");
let EventTable = exports.EventTable = class EventTable {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventTable.prototype, "eventID", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "cardMaker", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "cardDate", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "wishCollector", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "wishDate", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "giftPerson", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "giftDate", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "planner", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EventTable.prototype, "eventDate", void 0);
exports.EventTable = EventTable = __decorate([
    (0, typeorm_1.Entity)('eventTable')
], EventTable);
let NameTable = exports.NameTable = class NameTable {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NameTable.prototype, "nameID", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NameTable.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NameTable.prototype, "callback_data", void 0);
exports.NameTable = NameTable = __decorate([
    (0, typeorm_1.Entity)('nameTable')
], NameTable);
let WishTable = exports.WishTable = class WishTable {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WishTable.prototype, "wishID", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], WishTable.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], WishTable.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], WishTable.prototype, "wish", void 0);
exports.WishTable = WishTable = __decorate([
    (0, typeorm_1.Entity)('wishTable')
], WishTable);
let Person = exports.Person = class Person {
};
exports.Person = Person = __decorate([
    (0, typeorm_1.Entity)()
], Person);
class Assignment {
}
exports.Assignment = Assignment;
class Event {
}
exports.Event = Event;
