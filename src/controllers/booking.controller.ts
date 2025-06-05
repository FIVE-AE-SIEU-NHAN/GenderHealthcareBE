import { Request, Response } from 'express';
import databaseServices from '../services/database.services';


export const createBooking = async (req: Request, res: Response) => {
  const { consultantId, date, time, note } = req.body;
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
  }
  const customerId = req.user.id;

  if (!consultantId || !date || !time) {
    return res.status(400).json({ message: 'Thiếu thông tin đặt lịch.' });
  }

  try {
    const [result] = await databaseServices.query(
      'INSERT INTO bookings (customerId, consultantId, date, time, note) VALUES (?, ?, ?, ?, ?)',
      [customerId, consultantId, date, time, note]
    );
    res.status(201).json({ message: 'Đặt lịch thành công', bookingId: (result as any).insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
