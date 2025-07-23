  import { Request, Response, NextFunction } from 'express'
  import { TokenPayLoad } from '~/models/requests/users.requests'
  import { cycleServices } from '~/services/cycle.services'
import { prisma } from '~/services/client'
export const createCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad;
    const { last_period_date, cycle_length, period_length, note, mood, libido, stress, sleep_hours, energy } = req.body;

    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // 1. Lưu cycle
    const result = await cycleServices.createCycle({
      user_id,
      last_period_date,
      cycle_length,
      period_length,
      note,
      mood,
      libido,
      stress,
      sleep_hours,
      energy,
    });

    // 2. Predict phase, day, status
    const cycleDay = getCycleDay(last_period_date, cycle_length);
    const phase = getCyclePhase(cycleDay);
    const statusPredict = predictStatus(phase, {
      mood,
      libido,
      stress,
      sleep_hours,
      energy,
    });

    // 3. Gọi logic predictCycle cho predictionData
    const predictionData = await cycleServices.predictCycle(user_id);
    if (predictionData) {
      await prisma.cyclePrediction.create({
        data: {
          user_id,
          cycle_id: result.id,
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
      result,
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

export const getCyclePredictions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad
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
    return
  } catch (error) {
    next(error)
  }
}
  export const getAllCyclesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id } = req.decode_authorization as TokenPayLoad
    const cycles = await cycleServices.getAllCycles(user_id)
    res.status(200).json({ message: 'Fetched cycles successfully', cycles })
    return
  } catch (error) {
    next(error)
  }
}
export const deleteCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { user_id } = req.decode_authorization as TokenPayLoad

    const deleted = await cycleServices.deleteCycle(id, user_id)
    if (!deleted) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' })
      return
    }

    res.status(200).json({ message: 'Cycle deleted successfully' })
    return
  } catch (error) {
    next(error)
  }
}
 export const updateCycleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { user_id } = req.decode_authorization as TokenPayLoad

    const updatedCycle = await cycleServices.updateCycle(id, user_id, req.body)

    if (!updatedCycle) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' })
      return
    }

    res.status(200).json({ message: 'Cycle updated', updatedCycle })
    return
  } catch (error) {
    next(error)
  }
}
export const getCycleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { user_id } = req.decode_authorization as TokenPayLoad

    const cycle = await cycleServices.getCycleById(id, user_id)

    if (!cycle) {
      res.status(404).json({ message: 'Cycle not found or unauthorized' })
      return
    }

    res.status(200).json({ message: 'Cycle fetched successfully', cycle })
    return
  } catch (error) {
    next(error)
  }
}
export const getAllCyclesForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.decode_authorization as TokenPayLoad

    if (role !== 0) {
      res.status(403).json({ message: 'Forbidden: Not admin' })
      return
    }

    // LẤY CẢ USER
    const allCyclesRaw = await prisma.reproductiveCycle.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    // MAP RA user_name ĐỂ FE ĐỌC ĐƯỢC
    const allCycles = allCyclesRaw.map(cycle => ({
      ...cycle,
      user_name: cycle.user?.name ?? ''
    }))

    res.status(200).json({ message: 'Fetched all cycles', cycles: allCycles })
    return
  } catch (error) {
    next(error)
  }
}
export const getCyclePredictionByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const prediction = await cycleServices.predictCycle(user_id);
    if (!prediction) {
      res.status(404).json({ message: "Không có chu kỳ nào để dự đoán" });
      return;
    }
    res.status(200).json({ message: "Prediction fetched successfully", prediction });
    return;
  } catch (err) {
    next(err);
  }
};
function getCycleDay(startDate: string, cycleLength = 28): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays % cycleLength) + 1;
}

function getCyclePhase(day: number): string {
  if (day <= 5) return "menstrual";
  if (day <= 12) return "follicular";
  if (day <= 15) return "ovulation";
  return "luteal"; // PMS
}

interface StatusInput {
  mood?: number;
  libido?: number;
  stress?: number;
  sleep_hours?: number;
  energy?: number;
}

function predictStatus(phase: string, data: StatusInput) {
  const notes: string[] = [];
  let status = "Normal";

  if (data.stress !== undefined && data.sleep_hours !== undefined && data.stress >= 4 && data.sleep_hours < 6) {
    notes.push("High stress and lack of sleep may negatively affect your cycle.");
  }
  if (phase === "ovulation" && data.libido !== undefined && data.libido <= 2) {
    notes.push("Low libido during ovulation may signal a hormone imbalance.");
  }
  if (phase === "luteal" && data.mood !== undefined && data.mood <= 2) {
    notes.push("Poor mood in PMS phase may indicate premenstrual syndrome.");
  }
  if (phase === "follicular" && data.energy !== undefined && data.energy <= 2) {
    notes.push("Low energy during follicular phase, watch your health.");
  }
  if (notes.length >= 2) status = "Not positive";
  else if (notes.length === 1) status = "Need attention";

  return { status, notes };
}