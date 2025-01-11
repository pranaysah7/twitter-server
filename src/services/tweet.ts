import { prismaClient } from "../client/db"
import { redisClient } from "../client/redis"

export interface CreateTweetData{
    content:string
    imageUrl?:string
    userId: string
}
class TweetService{
    public static async createTweet(data: CreateTweetData){
        const rateLimit=await redisClient.get(`RATE_LIMIT:TWEET:${data.userId}`);
        console.log("HEELLLO"+rateLimit)
        if(rateLimit)throw new Error("Please wait..")
        await redisClient.del('ALL_TWEETS');
        await redisClient.setex(`RATE_LIMIT:TWEET:${data.userId}`,10,1)
        return await prismaClient.tweet.create({
            data:{
                content:data.content,
                imageUrl:data.imageUrl,
                author:{connect:{id:data.userId}}
            }
        })
    }
    public static async getAllTweets(){
        const cachedTweets=await redisClient.get('ALL_TWEETS');
        if(cachedTweets)return JSON.parse(cachedTweets);
        const tweets=await prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}})
        await redisClient.set('ALL_TWEETS',JSON.stringify(tweets));
        return tweets;
    }
}
export default TweetService;