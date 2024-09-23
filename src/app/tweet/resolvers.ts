
import { Tweet } from ".prisma/client";
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"

interface CreateTweetData{
    content:string
    imageUrl?:string

}
const queries={
    getAllTweets:()=>
        prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}}),
}
const mutations = {
    createTweet: async (parent: any, { payload }: { payload: CreateTweetData }, ctx: GraphqlContext) => {
      if (!ctx.user) throw new Error("You are not Authenticated!");
  
      try {
        const tweet = await prismaClient.tweet.create({
          data: {
            content: payload.content,
            imageUrl: payload.imageUrl,
            author: { connect: { id: ctx.user.id } },
          },
        });
        return tweet;
      } catch (error) {
        console.error("Error creating tweet:", error);
        // Handle the error, e.g., throw a custom error or return an error response
        throw new Error("Failed to create tweet. Please try again.");
      }
    },
  };
  const extraResolvers={
    Tweet:{
        author:(parent:Tweet)=>
        prismaClient.user.findUnique({where:{id:parent.authorId}})
    }
  }
export const resolvers={mutations,extraResolvers,queries}