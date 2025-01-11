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
const db_1 = require("../client/db");
const redis_1 = require("../client/redis");
class TweetService {
    static createTweet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const rateLimit = yield redis_1.redisClient.get(`RATE_LIMIT:TWEET:${data.userId}`);
            console.log("HEELLLO" + rateLimit);
            if (rateLimit)
                throw new Error("Please wait..");
            yield redis_1.redisClient.del('ALL_TWEETS');
            yield redis_1.redisClient.setex(`RATE_LIMIT:TWEET:${data.userId}`, 10, 1);
            return yield db_1.prismaClient.tweet.create({
                data: {
                    content: data.content,
                    imageUrl: data.imageUrl,
                    author: { connect: { id: data.userId } }
                }
            });
        });
    }
    static getAllTweets() {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedTweets = yield redis_1.redisClient.get('ALL_TWEETS');
            if (cachedTweets)
                return JSON.parse(cachedTweets);
            const tweets = yield db_1.prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
            yield redis_1.redisClient.set('ALL_TWEETS', JSON.stringify(tweets));
            return tweets;
        });
    }
}
exports.default = TweetService;
