import { AiType } from '@prisma/client'
import { prisma } from '~/services/client'

export default class ChatBotConfigRepository {
  private model = prisma.chatBotConfig

  async getChatBotConfig(id: AiType) {
    return this.model.findUnique({
      where: { id }
    })
  }

  async updateChatBotConfig({
    id,
    gemini_key,
    system_instruction,
    temperature,
    max_output_tokens
  }: {
    id: AiType
    gemini_key?: string
    system_instruction?: string
    temperature?: number
    max_output_tokens?: number
  }) {
    return this.model.update({
      where: { id },
      data: {
        ...(gemini_key && { gemini_key }),
        ...(system_instruction && { system_instruction }),
        ...(temperature && { temperature }),
        ...(max_output_tokens && { max_output_tokens })
      }
    })
  }
}
