"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql

    input CreateTweetData{
        content:String!
        imageUrl:String

    }
    type Tweet{
        id:ID!
        content:String!
        imageUrl:String

        author: User
       
    }
`;
