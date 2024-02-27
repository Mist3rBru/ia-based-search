import { randomUUID } from 'node:crypto'
import path from 'node:path'
import * as ytdl from 'ytdl-core'
import fmmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

export async function downloadVideoAsAudioFromYoutube(
  videoLink: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const audioPath = path.resolve(`public/tmp/${randomUUID()}.wav`)
    const audioFrequency = 16_000
    const audioBitrate = 128

    fmmpeg.setFfmpegPath(ffmpegStatic as unknown as string)
    fmmpeg(
      ytdl.default(videoLink, {
        quality: 'highestaudio',
        filter: 'audioonly',
      })
    )
      .audioFrequency(audioFrequency)
      .audioBitrate(audioBitrate)
      .audioChannels(1)
      .format('wav')
      .save(audioPath)
      .on('end', () => {
        resolve(audioPath)
      })
      .on('error', error => {
        console.error('Erro ao converter o vídeo', error)
        reject(error as Error)
      })
  })
}
