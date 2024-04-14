import express from "express";
import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import bodyParser from "body-parser";
interface incoming{
    name:String,
    cast:String
}
export async function initServer(){
    const app=express();
    app.use(bodyParser.json());
    const graphqlServer=new ApolloServer({
        typeDefs:`
            type Query{
                sayHello:String
                sayHellotoMe(name:String!,cast:String!):String
            }
        `,
        resolvers: {
            Query: {
                sayHello: ()=>`HELLO GRAPHQL`,
                sayHellotoMe: (parent:any,{name,cast}:incoming)=> `Hey ${name} ${cast}`,
            },
        },
    });

    await graphqlServer.start();

    app.use("/graphql", expressMiddleware(graphqlServer));

    return app;
}