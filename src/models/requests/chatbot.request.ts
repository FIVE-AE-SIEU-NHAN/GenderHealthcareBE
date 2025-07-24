import { AiType } from '@prisma/client'

export interface GetChatBotConfigReqBody {
  chatbot_type: AiType
}

export interface UpdateChatBotConfigReqBody {
  chatbot_type: AiType
  gemini_key?: string
  system_instruction?: string
  temperature?: number
  max_output_tokens?: number
}
