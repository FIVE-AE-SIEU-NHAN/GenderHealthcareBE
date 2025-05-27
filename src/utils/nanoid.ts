import { customAlphabet } from 'nanoid'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const generateOTP = customAlphabet(ALPHABET, 6)
