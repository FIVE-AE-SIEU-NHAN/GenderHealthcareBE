import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';
import * as BlogInteractions from '../services/bloginteraction.service';


export const getAllBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as 'createdAt' | 'title') || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const { blogs, total } = await blogService.getAllBlogs(page, limit, search, sortBy, sortOrder);

    res.set('X-Total-Count', total.toString());
    res.json(blogs);
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
      return;
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

export const getBlogDetail = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const userId = req.user?.id;
  const blog = await BlogInteractions.getBlogDetail(blogId, userId);
  res.json(blog);
};

export const likeBlog = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const userId = req.user?.id;
  const result = await BlogInteractions.likeBlog(blogId, userId);
  res.json(result);
};

export const commentBlog = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const userId = req.user?.id;
  const { content } = req.body;
  const comment = await BlogInteractions.commentBlog(blogId, userId, content);
  res.json(comment);
};

export const replyComment = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const userId = req.user?.id;
  const { content, parentId } = req.body;
  const reply = await BlogInteractions.replyComment(blogId, userId, content, parentId);
  res.json(reply);
};

export const getComments = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const comments = await BlogInteractions.getComments(blogId);
  res.json(comments);
};

export const getBlogStats = async (req: Request, res: Response) => {
  const blogId = Number(req.params.id);
  const stats = await BlogInteractions.getBlogStats(blogId);
  res.json(stats);
};

export const getCommentLikers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const commentId = Number(req.params.id);

  if (isNaN(commentId)) {
    res.status(400).json({ message: 'Invalid comment ID.' });
    return;
  }

  try {
    const likers = await BlogInteractions.getLikersForInteraction(commentId);
    res.json(likers);
  } catch (error) {
    next(error);
  }
};
