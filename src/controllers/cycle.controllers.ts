import { Request, Response, NextFunction } from 'express'
import { cycleServices } from '~/services/cycle.services'

export const createCycleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user?.id || (req.query.user_id as string) // fallback nếu không dùng token

    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' })
      return
    }

    const { last_period_date, cycle_length, period_length, note } = req.body
    const result = await cycleServices.createCycle({ user_id, last_period_date, cycle_length, period_length, note })
    res.status(201).json({ message: 'Cycle tracked successfully', result })
  } catch (error) {
    next(error)
  }
}

export const getCyclePredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user?.id || (req.query.user_id as string)

    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' })
      return
    }

    const prediction = await cycleServices.predictCycle(user_id)

    if (!prediction) {
      res.status(404).json({ message: 'Không có chu kỳ nào để dự đoán' })
      return
    }

    res.status(200).json({ message: 'Prediction fetched successfully', prediction })
  } catch (error) {
    next(error)
  }
}
