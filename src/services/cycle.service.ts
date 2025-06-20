import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface CycleInfo {
  id?: number;
  userId: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  note?: string;
}

// Lưu chu kỳ
export const createCycle = async (data: CycleInfo) => {
  return await prisma.cycle.create({
    data: {
      userId: data.userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      note: data.note,
    }
  });
};

// Lấy danh sách chu kỳ của 1 user
export const getCyclesByUser = async (userId: string) => {
  return await prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' }
  });
};
