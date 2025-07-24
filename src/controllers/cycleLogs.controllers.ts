import { Request, Response, NextFunction } from 'express';
import { cycleServices } from '~/services/cycle.services';

// Tạo 1 log cho cycle (mỗi ngày chỉ nên có 1 log)
export const createCycleLogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id } = req.params;
    const { log_date, mood, libido, stress, sleep_hours, energy } = req.body;

    const log = await cycleServices.createCycleLog({
      cycle_id,
      log_date,
      mood,
      libido,
      stress,
      sleep_hours,
      energy,
    });
    res.status(201).json({ message: 'Log created', log });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách log của 1 cycle
export const getCycleLogsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id } = req.params;
    const logs = await cycleServices.getLogsByCycleId(cycle_id);
    res.status(200).json({ message: 'Logs fetched', logs });
  } catch (error) {
    next(error);
  }
};
