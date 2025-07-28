import { Chat } from '@google/genai'
import { AiType, ChatBotRole, CycleLogStatus } from '@prisma/client'
import ChatBotHistoryRepository from '~/repositories/chatBotHistory.repository'
import { GoogleGenAI } from '@google/genai'
import ChatBotConfigRepository from '~/repositories/chatBotConfig.repository'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { CHATBOT_MESSAGES } from '~/constants/messages'
import { UpdateChatBotConfigReqBody } from '~/models/requests/chatbot.request'
import cycleServices from './cycle.services'

class ChatBotServices {
  private chatBotHistoryRepository: ChatBotHistoryRepository
  private chatBotConfigRepository: ChatBotConfigRepository

  constructor() {
    this.chatBotHistoryRepository = new ChatBotHistoryRepository()
    this.chatBotConfigRepository = new ChatBotConfigRepository()
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
    const temperature = 0.3
    const maxOutputTokens = 2048
    const geminiKey = 'AIzaSyD0WWusynLcMtSLfV0EP_zC24siVq4GO6A'
    const chatBotConfig = await this.chatBotConfigRepository.getChatBotConfig(AiType.AI_ASSISTANT)

    const ai = new GoogleGenAI({ apiKey: chatBotConfig?.gemini_key || geminiKey })

    // 2. Tạo chat
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-001',
      config: {
        systemInstruction: chatBotConfig?.system_instruction || systemInstruction,
        temperature: chatBotConfig?.temperature || temperature,
        topP: 0.7,
        topK: 20,
        maxOutputTokens: chatBotConfig?.max_output_tokens || maxOutputTokens,
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

  async getChatBotConfig(id: AiType) {
    const result = await this.chatBotConfigRepository.getChatBotConfig(id)
    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CHATBOT_MESSAGES.CHATBOT_CONFIG_NOT_FOUND
      })
    }
    return result
  }

  async updateChatBotConfig(payload: UpdateChatBotConfigReqBody) {
    const { chatbot_type, gemini_key, system_instruction, temperature, max_output_tokens } = payload
    return this.chatBotConfigRepository.updateChatBotConfig({
      id: chatbot_type,
      gemini_key,
      system_instruction,
      temperature,
      max_output_tokens
    })
  }

  async handleMenstrualPredictorAi(message: string): Promise<{
    status: CycleLogStatus
    note: string
  }> {
    // 1. Lấy thông tin

    const systemInstruction = `
    You are a women's reproductive health assistant. Your role is to analyze daily self-reported data from a user about their menstrual cycle, mood, libido, sleep, stress, and energy.

    You receive:
    - Start of last period: [yyyy-mm-dd]
    - Today is: [yyyy-mm-dd]
    - Cycle length (default 28): [number]
    - The user's self-reported values:
      - mood (1 - 5), libido (1 - 5), stress (1 - 5), sleep_hours (float), energy (1 - 5)

    Your task is to:

    1. Calculate the current cycle day as:
      - CycleDay = number of days since the start of the period, modulo the cycle length, then +1
      - Example: If today is 2025-07-28 and period started on 2025-07-01, CycleDay = ((28 - 1) % 28) + 1 = 28

    2. Determine the current hormonal phase:
      - Days 1-5: "menstruation"
      - Days 6-12: "follicular"
      - Days 13-15: "ovulation"
      - Days 16-28: "luteal (PMS)"

    3. Evaluate whether the user's state matches what is expected in that phase:
      - If **stress ≥ 4** and **sleep_hours < 6** → add note: "High stress and poor sleep may negatively impact your cycle."
      - If **phase = ovulation** and **libido ≤ 2** → add note: "Low libido during ovulation may indicate hormonal imbalance."
      - If **phase = luteal (PMS)** and **mood ≤ 2** → add note: "Low mood during PMS may indicate premenstrual syndrome."
      - If **phase = follicular** and **energy ≤ 2** → add note: "Low energy in the follicular phase may require attention to recovery or health."

    Always respond **strictly in JSON format**:
    {
      "status": "NORMAL" | "NEED ATTENTION" | "NOT POSITIVE",
      "notes": "..."
    }
    `
    const temperature = 0.3
    const maxOutputTokens = 2048
    const geminiKey = 'AIzaSyD0WWusynLcMtSLfV0EP_zC24siVq4GO6A'
    const chatBotConfig = await this.chatBotConfigRepository.getChatBotConfig(AiType.MENSTRUAL_PREDICTOR)

    const ai = new GoogleGenAI({ apiKey: chatBotConfig?.gemini_key || geminiKey })

    // 2. Tạo chat
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-001',
      config: {
        systemInstruction: chatBotConfig?.system_instruction || systemInstruction,
        temperature: chatBotConfig?.temperature || temperature,
        topP: 0.7,
        topK: 20,
        maxOutputTokens: chatBotConfig?.max_output_tokens || maxOutputTokens,
        stopSequences: ['User:', 'System:'],
        responseMimeType: 'application/json',
        seed: 42
      }
    })

    // 3. Gửi message
    const result = await chat.sendMessage({ message })
    const reply = JSON.parse(result.text || '{}')

    return {
      status: reply.status as CycleLogStatus,
      note: reply.notes
    }
  }
}

const chatBotServices = new ChatBotServices()
export default chatBotServices
