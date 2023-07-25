"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createId = void 0;
const nanoid_1 = require("nanoid");
const createId = () => (0, nanoid_1.nanoid)(16);
exports.createId = createId;
