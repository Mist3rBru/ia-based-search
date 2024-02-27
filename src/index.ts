/* eslint-disable no-secrets/no-secrets */
import 'dotenv/config'
import { askGpt } from './gpt.js'
import { redis, redisVectorStore } from './redis.js'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'

const textTokenSplitter = new TokenTextSplitter({
  encodingName: 'cl100k_base',
  chunkSize: 600,
  chunkOverlap: 0,
})

async function main(): Promise<void> {
  console.time('[TOTAL]')
  // const videoLink = 'https://www.youtube.com/watch?v=_YLXEiz3L_k'
  const videoLink = 'https://youtu.be/XzhGdoZ-WJk?si=pRozhLYVZdvBzbNB'

  console.time('[DOCS]')
  const textLoader = YoutubeLoader.createFromUrl(videoLink)
  const transcriptionDocs = await textLoader.load()
  const splittedTranscriptionDocs =
    await textTokenSplitter.splitDocuments(transcriptionDocs)
  console.log({ splittedTranscriptionDocs })
  console.timeEnd('[DOCS]')

  await redis.connect()
  await redisVectorStore.addDocuments(splittedTranscriptionDocs)

  console.time('[QUESTION]')
  await askGpt(
    'Como faço para alterar a imagem de capa de uma disciplina?',
    'Administração'
  )
  console.timeEnd('[QUESTION]')

  await redis.disconnect()
  console.timeEnd('[TOTAL]')
}

main().catch(console.error)
