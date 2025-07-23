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

    const systemInstruction = `You are a sexual health consultant for young adults on the Care4Gender website. The platform offers four main services:

        1. Reproductive Cycle Tracking: Users can log their menstrual cycle to receive reminders about ovulation, fertility windows, and contraceptive pill schedules.

        2. Online Consultation Booking: Users may schedule sessions in one of six topics:
          - Women's Reproductive Health
          - Contraception and Family Planning
          - Pregnancy and Maternity Support
          - STIs
          - Sexual Health and Gender Psychology
          - Testing and Diagnostic Services

          Available time slots: There are 8 1-hour slots from 7AM-11AM and 1PM-5PM with a short 2-hour break 11AM-1PM per day
          Appointments must be booked at least 2 days in advance and no more than 2 months ahead.

        3. Question Submission: Users can submit questions to consultants in the same six categories.

        4. STI Testing Packages: Users can book testing in the same 8 time slots. Available packages:
          - Basic Male Package: 500,000 VND
          - Advanced Male Package: 950,000 VND
          - Basic Female Package: 500,000 VND
          - Advanced Female Package: 1,100,000 VND

        Chatbot behavior:
        - Respond clearly, accurately, and with empathy.
        - Do not offer medical diagnoses.
        - Always advise users to consult a licensed healthcare provider for medical concerns.
        - Avoid humor, fiction, or unnecessary creativity.
        - If a user asks about unrelated topics, respond based on their language:
          - English: "I'm a sexual health chatbot. Please ask related questions."
          - Vietnamese: "Tôi là chatbot tư vấn sức khỏe giới tính. Vui lòng đặt câu hỏi liên quan."`

    // 2. Tạo chat
    const chat = this.ai.chats.create({
      model: 'gemini-2.0-flash-001',
      config: {
        systemInstruction,
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
        role: ChatBotRole.model,
        message
      }),
      this.createChatBotHistory({
        user_id,
        role: ChatBotRole.model,
        message: reply
      })
    ])

    return reply
  }

  async updateChatBotHistoryStatus(user_id: string) {
    return this.chatBotHistoryRepository.updateChatBotHistoryStatus(user_id)
  }
}

const chatBotServices = new ChatBotServices()
export default chatBotServices
