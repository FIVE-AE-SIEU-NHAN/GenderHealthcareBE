import { Request, Response } from 'express';
import databaseServices from '../services/database.services'
import { Blog } from '../types/blog.d';

// Lấy tất cả blog cùng tên user từ bảng Users
export const getAllBlogs = async (req: Request, res: Response) => {
    try {
      const blogs = await databaseServices.query('SELECT * FROM blogs ORDER BY createdAt DESC');
      console.log('Blogs from DB:', blogs);
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Tạo blog
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
