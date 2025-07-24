import { Request, Response, NextFunction } from 'express';
import { TokenPayLoad } from '~/models/requests/users.requests';
import { cycleServices } from '~/services/cycle.services';
import { prisma } from '~/services/client';
import { getCycleDay, getCyclePhase, predictStatus } from '~/utils/cycle';
// Tạo cycle và log ngày đầu tiên
export const createCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad;
    const { start_period_date, cycle_length, period_length, note, mood, libido, stress, sleep_hours, energy } = req.body;

    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // 1. Lưu cycle
    const cycle = await cycleServices.createCycle({
      user_id,
      start_period_date,
      cycle_length,
      period_length,
      note,
    });

    // 2. Lưu log cho ngày đầu chu kỳ
    await cycleServices.createCycleLog({
      cycle_id: cycle.id,
      log_date: start_period_date,
      mood,
      libido,
      stress,
      sleep_hours,
      energy,
    });

    // 3. Predict phase, day, status
    const cycleDay = getCycleDay(start_period_date, cycle_length);
    const phase = getCyclePhase(cycleDay);
    const statusPredict = predictStatus(phase, {
      mood,
      libido,
      stress,
      sleep_hours,
      energy,
    });

    // 4. Prediction cho cycle vừa tạo
    const predictionData = await cycleServices.predictCycle(cycle.id);
    if (predictionData) {
      await prisma.cyclePrediction.create({
        data: {
          cycle_id: cycle.id,
          next_period_date: new Date(predictionData.next_period_date),
          ovulation_date: new Date(predictionData.ovulation_date),
          fertile_window_start: new Date(predictionData.fertile_window_start),
          fertile_window_end: new Date(predictionData.fertile_window_end),
          pregnancy_risk: predictionData.pregnancy_risk,
        }
      });
    }

    res.status(201).json({
      message: 'Cycle tracked successfully',
      result: cycle,
      prediction: predictionData,
      statusPredict: {
        ...statusPredict,
        phase,
        cycleDay,
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get prediction cho cycle mới nhất của user
export const getCyclePredictions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad;
    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    const cycle = await cycleServices.getLatestCycle(user_id);
    if (!cycle) {
      res.status(404).json({ message: 'Không có chu kỳ nào để dự đoán' });
      return;
    }
    const prediction = await cycleServices.predictCycle(cycle.id);
    if (!prediction) {
      res.status(404).json({ message: 'Không có prediction' });
      return;
    }

    res.status(200).json({ message: 'Prediction fetched successfully', prediction });
  } catch (error) {
    next(error);
  }
};

// Lấy toàn bộ cycle của user
export const getAllCyclesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad;
    const cycles = await cycleServices.getAllCycles(user_id);
    res.status(200).json({ message: 'Fetched cycles successfully', cycles });
  } catch (error) {
    next(error);
  }
};

// Xoá cycle
export const deleteCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_id } = req.decode_authorization as TokenPayLoad;

    const deleted = await cycleServices.deleteCycle(id, user_id);
    if (!deleted) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Cycle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update cycle (chỉ update thông tin cơ bản, không update mood/stress...)
export const updateCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_id } = req.decode_authorization as TokenPayLoad;

    const updatedCycle = await cycleServices.updateCycle(id, user_id, req.body);

    if (!updatedCycle) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Cycle updated', updatedCycle });
  } catch (error) {
    next(error);
  }
};

// Lấy 1 cycle chi tiết
export const getCycleByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_id } = req.decode_authorization as TokenPayLoad;

    const cycle = await cycleServices.getCycleById(id, user_id);

    if (!cycle) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Cycle fetched successfully', cycle });
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả cycle cho admin
export const getAllCyclesForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.decode_authorization as TokenPayLoad;

    if (role !== 0) {
      res.status(403).json({ message: 'Forbidden: Not admin' });
      return;
    }

    const allCyclesRaw = await prisma.reproductiveCycle.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const allCycles = allCyclesRaw.map(cycle => ({
      ...cycle,
      user_name: cycle.user?.name ?? ''
    }));

    res.status(200).json({ message: 'Fetched all cycles', cycles: allCycles });
  } catch (error) {
    next(error);
  }
};

// Lấy prediction cho 1 user (admin)
export const getCyclePredictionByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.decode_authorization as TokenPayLoad;
    if (role !== 0) {
      res.status(403).json({ message: "Forbidden: Not admin" });
      return;
    }
    const { user_id } = req.params;
    if (!user_id) {
      res.status(400).json({ message: "user_id is required" });
      return;
    }

    const cycle = await cycleServices.getLatestCycle(user_id);
    if (!cycle) {
      res.status(404).json({ message: "Không có chu kỳ nào để dự đoán" });
      return;
    }

    const prediction = await cycleServices.predictCycle(cycle.id);
    if (!prediction) {
      res.status(404).json({ message: "Không có prediction" });
      return;
    }
    res.status(200).json({ message: "Prediction fetched successfully", prediction });
  } catch (err) {
    next(err);
  }
};
