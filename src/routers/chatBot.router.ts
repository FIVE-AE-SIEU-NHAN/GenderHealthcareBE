import express from 'express'
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const chatBotRouter = express.Router()

chatBotRouter.post('/test', async (req, res) => {
  const { script } = req.body
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: script,
    config: {
      systemInstruction:
        'You are a sexual health consultant for young adults. You answer clearly, accurately, and kindly. You never give medical diagnosis. You always recommend visiting a real doctor. You avoid jokes or unnecessary creativity. If a user asks about any unrelated topic, you **always respond with: "I\'m a sexual health chatbot. Please ask related questions."**',
      temperature: 0.3,
      topP: 0.7,
      topK: 20,
      maxOutputTokens: 2048,
      stopSequences: ['User:', 'System:'],
      responseMimeType: 'text/plain',
      seed: 42
    }
  })

  res.status(200).json({
    message: 'AI HAY PRO',
    result: response.candidates
  })
})

export default chatBotRouter
