
import { Tweet } from ".prisma/client";
import { prismaClient } from "../../client/db"
import { GraphqlContext } from "../../interfaces"
import { S3Client ,PutObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
interface CreateTweetData{
    content:string
    imageUrl?:string

}
const s3Client = new S3Client(
  {
    region:"ap-south-1",
    credentials:{accessKeyId:"AKIA5G2VGHXYKBPDZWWP",
    secretAccessKey:"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"},
  }
)
const queries={
    getAllTweets:()=>
        prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}}),
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
              Bucket: 'pranaytwitter',
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