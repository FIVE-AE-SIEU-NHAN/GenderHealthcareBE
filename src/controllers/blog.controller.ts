import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.json(blogs); // KHÔNG return
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const blog = await blogService.getBlogById(id);
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return; // Cần return để ngăn tiếp tục chạy
    }
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body;
    const newBlog = await blogService.createBlog(data);
    res.status(201).json(newBlog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const data = req.body;
    const updatedBlog = await blogService.updateBlog(id, data);
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = Number(req.params.id);
  try {
    await blogService.deleteBlog(id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};
