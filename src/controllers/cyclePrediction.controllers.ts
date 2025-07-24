import { Request, Response, NextFunction } from 'express';
import { prisma } from '~/services/client';
import { cyclePredictionServices } from '~/services/cyclePrediction.services';
import { TokenPayLoad } from '~/models/requests/users.requests';

// Lấy toàn bộ prediction (admin)
export const getAllPredictionsAdminController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.decode_authorization as TokenPayLoad;
    if (role !== 0) {
      res.status(403).json({ message: 'Forbidden: Not admin' });
      return;
    }
    const predictions = await cyclePredictionServices.getAllPredictionsForAdmin();
    // Đảm bảo luôn trả về user_id của cycle (user_id nằm trên cycle chứ không nằm trên user)
    const mapped = predictions.map(pred => ({
      ...pred,
      user_name: pred.cycle?.user?.name || '',
      user_id: pred.cycle?.user_id || pred.cycle?.user?.id || '', // Lấy user_id từ cycle trước, nếu không có thì lấy từ user object
    }));
    res.status(200).json({ message: 'All prediction history', predictions: mapped });
  } catch (error) {
    next(error);
  }
};

// Lấy prediction theo cycleId
export const getCyclePredictionByCycleId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cycleId } = req.params;
    // lấy thông tin cycle
    const cycle = await prisma.reproductiveCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      res.status(404).json({ message: "Không tìm thấy chu kỳ" });
      return;
    }
    const ovulationDate = new Date(cycle.start_period_date);
    ovulationDate.setDate(ovulationDate.getDate() + (cycle.cycle_length - 14));
    const nextPeriod = new Date(cycle.start_period_date);
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
