import { Request, Response, NextFunction } from 'express';
import { cycleServices } from '~/services/cycle.services';
import { prisma } from '~/services/client'
import { v4 as uuidv4 } from 'uuid'

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


export const getCycleLogsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id } = req.params;
    const logs = await cycleServices.getLogsByCycleId(cycle_id);
    res.status(200).json({ message: 'Logs fetched', logs });
  } catch (error) {
    next(error);
  }
};

export const upsertCycleLogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id } = req.params
    const { log_date, mood, libido, stress, sleep_hours, energy, status } = req.body
    if (!log_date) {
      res.status(400).json({ message: 'log_date is required' })
      return
    }
    const logDate = new Date(log_date)
    logDate.setHours(0, 0, 0, 0)

    // Kiểm tra đã có log ngày đó chưa
    let log = await prisma.cycleStatusLogs.findFirst({
      where: { cycle_id, log_date: logDate }
    })

    if (log) {
      // Update nếu đã có
      log = await prisma.cycleStatusLogs.update({
        where: { id: log.id },
        data: { mood, libido, stress, sleep_hours, energy, status }
      })
    } else {
      // Tạo mới nếu chưa có
      log = await prisma.cycleStatusLogs.create({
        data: {
          id: uuidv4(),
          cycle_id,
          log_date: logDate,
          mood,
          libido,
          stress,
          sleep_hours,
          energy,
          status
        }
      })
    }

    res.status(200).json({ message: 'Log saved', log })
  } catch (error) {
    next(error)
  }
};

// Lấy toàn bộ log của 1 cycle
export const getLogsByCycleIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id } = req.params
    const logs = await prisma.cycleStatusLogs.findMany({
      where: { cycle_id },
      orderBy: { log_date: 'asc' }
    })
    res.status(200).json({ logs })
  } catch (error) {
    next(error)
  }
};

// Lấy log theo ngày cụ thể của 1 cycle
export const getLogByCycleIdAndDateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_id, log_date } = req.params
    const dateObj = new Date(log_date)
    dateObj.setHours(0, 0, 0, 0)

    const log = await prisma.cycleStatusLogs.findFirst({
      where: { cycle_id, log_date: dateObj }
    })
    if (!log) {
      res.status(404).json({ message: 'Log not found' })
      return
    }
    res.status(200).json({ log })
  } catch (error) {
    next(error)
  }
};