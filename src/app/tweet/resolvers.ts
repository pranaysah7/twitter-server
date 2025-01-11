
import { Tweet } from ".prisma/client";
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"
import { S3Client ,PutObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { CreateTweetData } from "../../services/tweet";

const s3Client = new S3Client({
  region:process.env.AWS_DEFAULT_REGION
});
const queries={
        getAllTweets:()=>
        TweetService.getAllTweets(),

        getSignedUrlForTweet: async(parent:any,{imageName,imageType}:{imageName:string,imageType:string},ctx:GraphqlContext)=>{
          console.log(ctx.user);
            if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
            const allowedImageTypes=[
              "image/jpg",
              "image/jpeg",
              "image/png",
              "image/webp"];
            console.log("here")
            console.log(imageType)
            if(!allowedImageTypes.includes(imageType))
              throw new Error("Unsupported Image type");
            const putObjectCommand = new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
            })
            const signedUrl=await getSignedUrl(s3Client,putObjectCommand);
          return signedUrl;
        }
}
const mutations = {
    createTweet: async (parent: any, { payload }: { payload: CreateTweetData }, ctx: GraphqlContext) => {
      if (!ctx.user) throw new Error("You are not Authenticated!");
  
      try {
        const tweet = await TweetService.createTweet({
          ...payload,
          userId:ctx.user.id
        })
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
        UserService.getUserById(parent.authorId)
    }
  }
export const resolvers={mutations,extraResolvers,queries}