"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisClient = new ioredis_1.default("rediss://default:Ade5AAIjcDE2YzMyNzcyMGQ5ZDA0ZjJiODUwNTExYjNmNzNiZTIxOXAxMA@enormous-marlin-55225.upstash.io:6379");
