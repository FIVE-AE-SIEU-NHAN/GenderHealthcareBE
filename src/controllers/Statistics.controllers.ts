import { Request, Response } from "express";
import { prisma } from "~/services/client";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { format } from "date-fns";
export const getDashboardStatistic = async (req: Request, res: Response) => {
  try {
    
    const customerCount = await prisma.users.count({ where: { role: 3 } });
    const staffCount = await prisma.users.count({ where: { role: { in: [0, 1, 2, 4] } } });
    const doctorCount = await prisma.users.count({ where: { role: 4 } });
    const appointmentCount = await prisma.appointments.count();
    const totalRevenue = await prisma.payments.aggregate({ _sum: { amount: true } });
    const monthlyRevenue = totalRevenue._sum.amount || 0;
    const appointmentBookingCount = await prisma.appointments.count();
    const testServiceBookingCount = await prisma.testServiceAppointments.count();
    const totalServiceBookings = appointmentBookingCount + testServiceBookingCount;
    const [pending, ongoing, completed, cancelled] = await Promise.all([
      prisma.appointments.count({ where: { status: "PENDING" } }),
      prisma.appointments.count({ where: { status: "ONGOING" } }),
      prisma.appointments.count({ where: { status: "COMPLETED" } }),
      prisma.appointments.count({ where: { status: "CANCELLED" } }),
    ]);
    const totalBooking = pending + ongoing + completed + cancelled || 1;

  const bookingStatusData = [
  { status: 'PENDING', count: pending, percentage: Math.round(pending / totalBooking * 1000) / 10, color: '#F59E0B' },
  { status: 'ONGOING', count: ongoing, percentage: Math.round(ongoing / totalBooking * 1000) / 10, color: '#3B82F6' },
  { status: 'COMPLETED', count: completed, percentage: Math.round(completed / totalBooking * 1000) / 10, color: '#22C55E' },
  { status: 'CANCELLED', count: cancelled, percentage: Math.round(cancelled / totalBooking * 1000) / 10, color: '#EF4444' },
];

    
    const [
      testPending, testCheckin, testOngoing, testInputResults,
      testCompleted, testCancelled
    ] = await Promise.all([
      prisma.testServiceAppointments.count({ where: { status: "PENDING" } }),
      prisma.testServiceAppointments.count({ where: { status: "CHECKIN" } }),
      prisma.testServiceAppointments.count({ where: { status: "ONGOING" } }),
      prisma.testServiceAppointments.count({ where: { status: "INPUT_RESULTS" } }),
      prisma.testServiceAppointments.count({ where: { status: "COMPLETED" } }),
      prisma.testServiceAppointments.count({ where: { status: "CANCELLED" } }),
    ]);
    const totalTestService = testPending + testCheckin + testOngoing + testInputResults + testCompleted + testCancelled || 1;
const payments = await prisma.payments.findMany({
  where: { status: "SUCCESS" },
  select: { amount: true, created_at: true }
});
const appointments = await prisma.appointments.findMany({
  select: { id: true, created_at: true }
});
const testServiceAppointments = await prisma.testServiceAppointments.findMany({
  select: { id: true, created_at: true }
});

// 2. Group từng cái theo tháng (JS)
const revenueByMonth: { [key: string]: number } = {};
const bookingByMonth: { [key: string]: number } = {};

payments.forEach(item => {
  const month = format(item.created_at, "yyyy-MM");
  revenueByMonth[month] = (revenueByMonth[month] || 0) + item.amount;
});
appointments.forEach(item => {
  const month = format(item.created_at, "yyyy-MM");
  bookingByMonth[month] = (bookingByMonth[month] || 0) + 1;
});
testServiceAppointments.forEach(item => {
  const month = format(item.created_at, "yyyy-MM");
  bookingByMonth[month] = (bookingByMonth[month] || 0) + 1;
});

// 3. Gộp lại thành mảng data
const allMonths = Array.from(new Set([
  ...Object.keys(revenueByMonth),
  ...Object.keys(bookingByMonth)
])).sort();

const monthlyStats = allMonths.map(month => ({
  month,
  revenue: revenueByMonth[month] || 0,
  appointments: bookingByMonth[month] || 0,
}));

 const testServiceStatusData = [
  { status: 'PENDING', count: testPending, percentage: Math.round(testPending / totalTestService * 1000) / 10, color: "#F59E0B" },
  { status: 'CHECKIN', count: testCheckin, percentage: Math.round(testCheckin / totalTestService * 1000) / 10, color: "#6366F1" },
  { status: 'ONGOING', count: testOngoing, percentage: Math.round(testOngoing / totalTestService * 1000) / 10, color: "#3B82F6" },
  { status: 'INPUT_RESULTS', count: testInputResults, percentage: Math.round(testInputResults / totalTestService * 1000) / 10, color: "#06B6D4" },
  { status: 'COMPLETED', count: testCompleted, percentage: Math.round(testCompleted / totalTestService * 1000) / 10, color: "#22C55E" },
  { status: 'CANCELLED', count: testCancelled, percentage: Math.round(testCancelled / totalTestService * 1000) / 10, color: "#EF4444" },
];

   
    res.json({
      customerCount,
      staffCount,
      doctorCount,
      appointmentCount,
      monthlyRevenue,
      bookingStatusData,       
      testServiceStatusData,
      monthlyStats,
      serviceBookingCount: totalServiceBookings, 
    });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê!", err });
  }
  
}
