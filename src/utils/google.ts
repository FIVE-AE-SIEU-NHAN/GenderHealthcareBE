import { TokenGoogleVerifyPayload } from '~/models/requests/users.requests'

export const verifyGoogleToken = async (token: string): Promise<TokenGoogleVerifyPayload> => {
  const { OAuth2Client } = await import('google-auth-library')
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  console.log('>>> payload', payload)
  return payload as TokenGoogleVerifyPayload
}
