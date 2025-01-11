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
exports.resolvers = void 0;
const db_1 = require("../../client/db");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    region: "ap-south-1",
    credentials: { accessKeyId: "AKIA5G2VGHXYKBPDZWWP",
        secretAccessKey: "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" },
});
const queries = {
    getAllTweets: () => db_1.prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
    getSignedUrlForTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { imageName, imageType }, ctx) {
        console.log(ctx.user);
        if (!ctx.user || !ctx.user.id)
            throw new Error("Unauthenticated");
        const allowedImageTypes = [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];
        console.log("here");
        console.log(imageType);
        if (!allowedImageTypes.includes(imageType))
            throw new Error("Unsupported Image type");
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: 'pranaytwitter',
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand);
        return signedUrl;
    })
};
const mutations = {
    createTweet: (parent_2, _b, ctx_2) => __awaiter(void 0, [parent_2, _b, ctx_2], void 0, function* (parent, { payload }, ctx) {
        if (!ctx.user)
            throw new Error("You are not Authenticated!");
        try {
            const tweet = yield db_1.prismaClient.tweet.create({
                data: {
                    content: payload.content,
                    imageUrl: payload.imageUrl,
                    author: { connect: { id: ctx.user.id } },
                },
            });
            return tweet;
        }
        catch (error) {
            console.error("Error creating tweet:", error);
            // Handle the error, e.g., throw a custom error or return an error response
            throw new Error("Failed to create tweet. Please try again.");
        }
    }),
};
const extraResolvers = {
    Tweet: {
        author: (parent) => db_1.prismaClient.user.findUnique({ where: { id: parent.authorId } })
    }
};
exports.resolvers = { mutations, extraResolvers, queries };
