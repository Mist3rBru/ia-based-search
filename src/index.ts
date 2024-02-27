/* eslint-disable no-secrets/no-secrets */
import 'dotenv/config'
import { askGpt } from './gpt.js'
import { downloadVideoAsAudioFromYoutube } from './download-video-from-youtube.js'
import { transcribeAudio } from './transcribe-audio.js'
import { redis, redisVectorStore } from './redis.js'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { rm } from 'node:fs/promises'

const textTokenSplitter = new TokenTextSplitter({
  encodingName: 'cl100k_base',
  chunkSize: 600,
  chunkOverlap: 0,
})

async function main(): Promise<void> {
  console.time('[TOTAL]')
  const videoLink = 'https://www.youtube.com/watch?v=_YLXEiz3L_k'

  console.time('[DOWNLOAD]')
  // const audioPath =
  //   '/git/ia-based-search/public/tmp/fbde0b33-a6a8-44d7-8fe4-2a3fdf1deb04.wav'
  const audioPath = await downloadVideoAsAudioFromYoutube(videoLink)
  console.timeEnd('[DOWNLOAD]')

  console.time('[TRANSCRIPTION]')
  const transcriptionPath = await transcribeAudio(audioPath)
  console.timeEnd('[TRANSCRIPTION]')

  await rm(audioPath, { force: true })

  console.time('[DOCS]')
  const textLoader = new TextLoader(transcriptionPath)
  const transcriptionDocs = await textLoader.load()
  const splittedTranscriptionDocs =
    await textTokenSplitter.splitDocuments(transcriptionDocs)
  console.log({ splittedTranscriptionDocs })
  console.timeEnd('[DOCS]')

  await rm(transcriptionPath, { force: true })

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
