import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { Tweet } from "../tweet";
import { User } from ".prisma/client";
import UserService from "../../services/user";

const queries ={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
      return await UserService.verifyGoogleAuthToken(token);
    },
    getCurrentUser:async(parent:any,args:any,ctx:GraphqlContext)=>{
        
        const id = ctx.user?.id;
        if(!id)
            return null;
        let user;
        try{
            user =await UserService.getUserById(id);
        }
        catch(error){
            console.log(error)
        }
        
        return user; 
    },
    getUserById: async(parent:any,{id}:{id:string},ctx:GraphqlContext)=>
    UserService.getUserById(id)
    
};
const extraResolvers={
    User:{
        tweets:(parent:User)=>
        prismaClient.tweet.findMany({where:{author:{id:parent.id}}}),
        followers:async (parent:User)=>
            {
                {
                    const result= await prismaClient.follows.findMany({where:{following:{id:parent.id}},include:{follower:true}})
                    return (result).map(el=>el.follower)
                    }
            },
        following:async(parent:User)=>
            {
            const result= await prismaClient.follows.findMany(
                {where:{follower:{id:parent.id}},include:{following:true}})
            return (result).map(el=>el.following)
            }

    }
  }
  const mutations={
    followUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext)=>{
        if(!ctx.user || !ctx.user.id)throw new Error("Unauthenticated")
        await UserService.followUser(ctx.user.id,to);
    return true;
    },
    unFollowUser:async (parent:any,{to}:{to:string},ctx:GraphqlContext)=>{
        if(!ctx.user || !ctx.user.id)throw new Error("Unauthenticated")
        await UserService.unFollowUser(ctx.user.id,to);
    return true;
    }
  }
export const resolvers={queries,extraResolvers,mutations}