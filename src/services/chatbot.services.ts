import { Chat } from '@google/genai'
import { ChatBotRole } from '@prisma/client'
import ChatBotHistoryRepository from '~/repositories/chatBotHistory.repository'
import { GoogleGenAI } from '@google/genai'

class ChatBotServices {
  private chatBotHistoryRepository: ChatBotHistoryRepository
  private ai: GoogleGenAI

  constructor() {
    this.chatBotHistoryRepository = new ChatBotHistoryRepository()
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  }

  async createChatBotHistory(data: { user_id: string; role: ChatBotRole; message: string }) {
    return this.chatBotHistoryRepository.createChatBotHistory(data)
  }

  async getChatBotHistoryByUserId(user_id: string) {
    return this.chatBotHistoryRepository.getChatBotHistoryByUserId(user_id)
  }

  async handleChatBotMessage(user_id: string, message: string) {
    // 1. Lấy lịch sử chat
    const historyData = await this.getChatBotHistoryByUserId(user_id)

    const history = historyData.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }]
    }))

    // 2. Tạo chat
    const chat = this.ai.chats.create({
      model: 'gemini-2.0-flash-001',
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
      },
      history
    })

    // 3. Gửi message
    const result = await chat.sendMessage({ message })
    const reply = result.text || ''

    // 4. Lưu vào DB
    await Promise.all([
      this.createChatBotHistory({
        user_id,
        role: 'user',
        message
      }),
      this.createChatBotHistory({
        user_id,
        role: 'model',
        message: reply
      })
    ])

    return reply
  }
}

const chatBotServices = new ChatBotServices()
export default chatBotServices
