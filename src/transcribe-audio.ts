import { pipeline } from '@xenova/transformers'
import { readFile, writeFile } from 'node:fs/promises'

import wav from 'node-wav'

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  const audioFile = await readFile(audioFilePath)
  const audioFileDecoded = wav.decode(audioFile)
  const audioData = audioFileDecoded.channelData[0]
  const audioFloatArray = new Float32Array(audioData)

  const transcribe = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-small'
  )

  const transcriptionResult = await transcribe(audioFloatArray, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: 'portuguese',
    task: 'transcribe',
  })

  const transcription = Array.isArray(transcriptionResult)
    ? transcriptionResult.map(t => t.text).join('\n')
    : transcriptionResult.text

  const transcriptionPath = audioFilePath.replace('.wav', '.txt')
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(transcriptionPath, transcription)

  return transcriptionPath
}
