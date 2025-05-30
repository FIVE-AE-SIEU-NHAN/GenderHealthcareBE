import { Request, Response } from 'express';
import databaseServices from '../services/database.services';

// Kiểu blog đơn giản
interface Blog {
  id: number;
  userId: number;
  title: string;
  content: string;
  mainImage: string; // đổi tên nếu cần
  summary?: string;
  subImage?: string;
  section1?: string;
  section2?: string;
  createdAt: Date;
  authorName?: string;
}

// Lấy tất cả blog
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const result = await databaseServices.query(
      `
      SELECT blogs.*, Users.name AS authorName
      FROM blogs
      INNER JOIN Users ON blogs.userId = Users._id
      ORDER BY blogs.createdAt DESC
    `
    );

    const blogs = result as Blog[]; // ép kiểu
    res.json(blogs);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả blog:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await databaseServices.query(
      `
      SELECT blogs.*, Users.name AS authorName
      FROM blogs
      INNER JOIN Users ON blogs.userId = Users._id
      WHERE blogs.id = ?
    `,
      [id]
    );

    const blogList = result as Blog[];

    if (!blogList || blogList.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy blog' });
    }

    res.json(blogList[0]);
  } catch (error) {
    console.error('Lỗi khi lấy blog theo ID:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
// Tạo blog
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { userId, title, content } = req.body;
    const image = req.file?.filename;

    if (!userId || !title || !content || !image) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    await databaseServices.query(
      'INSERT INTO blogs (userId, title, content, image, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [userId, title, content, image]
    );

    res.status(201).json({ message: 'Tạo blog thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo blog:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};
