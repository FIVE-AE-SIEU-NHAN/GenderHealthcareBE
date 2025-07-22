import { Request, Response } from "express";
import { prisma } from "~/services/client";

export const getDashboardStatistic = async (req: Request, res: Response) => {
  try {
    // Sửa lại số 0, 1 cho đúng với role định nghĩa
    const customerCount = await prisma.users.count({ where: { role: 3 } });
    const staffCount = await prisma.users.count({ where: { role: { in: [0, 1, 2, 4] } } });
    const doctorCount = await prisma.users.count({ where: { role: { in: [ 4] } } });
    const appointmentCount = await prisma.appointments.count();
      const totalRevenue = await prisma.payments.aggregate({_sum: { amount: true,},});
       const monthlyRevenue = totalRevenue._sum.amount || 0;
    res.json({
      customerCount,
      staffCount,
      doctorCount,
      appointmentCount,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê!" });
  }
};