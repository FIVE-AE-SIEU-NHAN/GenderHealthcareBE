//users.controllers.ts
import { Request, Response } from 'express'
import emailServices from '~/services/email.services'

export const emailController = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    if (email) {
      console.log('Email:', email)
      const result = await emailServices.sendMail(email)
      res.status(200).json({ message: 'Email sent successfully' })
    } else {
      res.status(400).json({ error: 'Email is required' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' })
  }
}
