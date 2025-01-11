import { prismaClient } from "../client/db"

export interface CreateTweetData{
    content:string
    imageUrl?:string
    userId: string
}
class TweetService{
    public static async createTweet(data: CreateTweetData){
        return await prismaClient.tweet.create({
            data:{
                content:data.content,
                imageUrl:data.imageUrl,
                author:{connect:{id:data.userId}}
            }
        })
    }
    public static async getAllTweets(){
        return await prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}})
    }
}
export default TweetService;