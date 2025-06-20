import { Request, Response } from 'express';
import * as CycleService from '../services/cycle.service';
import { calculateCycleDetails } from '../utils/cycle.utils';

export const createCycle = async (req: Request, res: Response) => {
  const { userId, startDate, endDate, note } = req.body;

  const saved = await CycleService.createCycle({ userId, startDate, endDate, note });
  const calculated = calculateCycleDetails(startDate);

  res.status(201).json({
    message: "Chu kỳ đã được lưu",
    cycle: saved,
    ovulationDate: calculated.ovulation,
    fertileWindow: {
      from: calculated.fertileStart,
      to: calculated.fertileEnd,
    },
    pillReminder: calculated.pillReminder
  });
};

export const getUserCycles = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const cycles = await CycleService.getCyclesByUser(userId);
  res.json(cycles);
};
