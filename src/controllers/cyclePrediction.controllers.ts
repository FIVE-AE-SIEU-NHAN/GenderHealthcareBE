
import { prisma } from '~/services/client'
  import { Request, Response, NextFunction } from 'express'
  import { cyclePredictionServices } from '~/services/cyclePrediction.services'
  import { TokenPayLoad } from '~/models/requests/users.requests'

  export const createPredictionController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user_id } = req.decode_authorization as TokenPayLoad
      const { cycle_id, next_period_date, ovulation_date, fertile_window_start, fertile_window_end } =
        req.body

      if (!cycle_id || !next_period_date || !ovulation_date || !fertile_window_start || !fertile_window_end) {
        res.status(400).json({ message: 'Thiếu dữ liệu dự đoán' })
        return
      }
  const today = new Date();
  function calculatePregnancyRisk(today: Date, fertileStart: Date, fertileEnd: Date): string {
    today.setHours(0, 0, 0, 0);
    fertileStart.setHours(0, 0, 0, 0);
    fertileEnd.setHours(0, 0, 0, 0);
    if (today >= fertileStart && today <= fertileEnd) return "CAO";
    const beforeStart = new Date(fertileStart); beforeStart.setDate(beforeStart.getDate() - 2);
    const afterEnd = new Date(fertileEnd); afterEnd.setDate(afterEnd.getDate() + 2);
    if ((today >= beforeStart && today < fertileStart) || (today > fertileEnd && today <= afterEnd)) return "TRUNG_BÌNH";
    return "THẤP";
  }

  const risk = calculatePregnancyRisk(
    today,
    new Date(fertile_window_start),
    new Date(fertile_window_end)
  );
      const prediction = await cyclePredictionServices.createPrediction({
        user_id,
        cycle_id,
        next_period_date: new Date(next_period_date),
        ovulation_date: new Date(ovulation_date),
        fertile_window_start: new Date(fertile_window_start),
        fertile_window_end: new Date(fertile_window_end),
        pregnancy_risk: risk  
      })

      res.status(201).json({ message: 'Prediction saved successfully', prediction })
    } catch (error) {
      next(error)
    }
  }

  export const getPredictionsByUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user_id } = req.decode_authorization as TokenPayLoad

      const predictions = await cyclePredictionServices.getPredictionsByUser(user_id)

      res.status(200).json({ message: 'User prediction history', predictions })
    } catch (error) {
      next(error)
    }
  }

  export const getAllPredictionsAdminController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role } = req.decode_authorization as TokenPayLoad
      if (role !== 0) {
        res.status(403).json({ message: 'Forbidden: Not admin' })
        return
      }

      const predictions = await cyclePredictionServices.getAllPredictionsForAdmin()
 const mapped = predictions.map(pred => ({
      ...pred,
       user_name: pred.cycle?.user?.name || '',    // <-- Đảm bảo có trường này
      user_id: pred.cycle?.user?.id || pred.user_id,  }));
      res.status(200).json({ message: 'All prediction history', predictions })
    } catch (error) {
      next(error)
    }
  }
 export const getCyclePredictionByCycleId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cycleId } = req.params;
    // lấy thông tin cycle
    const cycle = await prisma.reproductiveCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      res.status(404).json({ message: "Không tìm thấy chu kỳ" });
      return;
    }

    // Tính prediction giống predictCycle
    const ovulationDate = new Date(cycle.last_period_date);
    ovulationDate.setDate(ovulationDate.getDate() + (cycle.cycle_length - 14));
    const nextPeriod = new Date(cycle.last_period_date);
    nextPeriod.setDate(nextPeriod.getDate() + cycle.cycle_length);

    const prediction = {
      next_period_date: nextPeriod,
      ovulation_date: ovulationDate,
      fertile_window_start: new Date(ovulationDate.getTime() - 2 * 86400000),
      fertile_window_end: new Date(ovulationDate.getTime() + 2 * 86400000)
    };
    res.status(200).json({ prediction });
  } catch (err) {
    next(err);
  }
};





