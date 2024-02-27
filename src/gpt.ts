import { RetrievalQAChain } from 'langchain/chains'
import { redisVectorStore } from './redis.js'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { PromptTemplate } from '@langchain/core/prompts'

const chatIa = new ChatGoogleGenerativeAI({
  modelName: 'gemini-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
  temperature: 0.3,
})

export async function askGpt(
  question: string,
  courseName: string
): Promise<string> {
  const prompt = new PromptTemplate({
    template: `
      Você responde perguntas de um curso de {courseName}.
      O usuário está assistindo um curso com várias aulas.
      Use o conteúdo das transcrições das aulas abaixo para responder a pergunta do usuário.
      Se a responta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.

      Transcrição:
      {context}

      Pergunta:
      {question}
  `.trim(),
    inputVariables: ['context', 'question', 'courseName'],
    partialVariables: { courseName },
  })

  const chain = RetrievalQAChain.fromLLM(
    chatIa,
    redisVectorStore.asRetriever(),
    { prompt }
  )
  const response = (await chain.invoke({ query: question })) as { text: string }

  console.log(response)

  return response.text
}
