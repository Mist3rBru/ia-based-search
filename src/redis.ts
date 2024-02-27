import { RedisVectorStore } from '@langchain/redis'
import { createClient } from 'redis'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

export const redis = createClient({ url: 'redis://127.0.0.1:6379' })

export const redisVectorStore = new RedisVectorStore(
  new GoogleGenerativeAIEmbeddings(),
  {
    indexName: 'videos-embeddings',
    redisClient: redis,
    keyPrefix: 'videos:',
  }
)
