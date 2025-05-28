import { Request, Response } from 'express';
import databaseServices from '../services/database.services';

// Lấy tất cả blogs và tên người tạo từ bảng Users
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await databaseServices.query(`
      SELECT blogs.*, Users.name AS authorName
      FROM blogs
      INNER JOIN Users ON blogs.userId = Users._id
      ORDER BY blogs.createdAt DESC
    `);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Tạo blog mới
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { userId, title, content } = req.body;
    const image = req.file?.filename;

    if (!userId || !title || !content || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await databaseServices.query(
      'INSERT INTO blogs (userId, title, content, image, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [userId, title, content, image]
    );

    res.json({ message: 'Blog created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
