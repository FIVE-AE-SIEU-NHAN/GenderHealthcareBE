import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller';
import { wrapAsync } from '~/utils/handler'

const router = express.Router();

router.get('/', wrapAsync(getAllBlogs));
router.get('/:id', wrapAsync(getBlogById));
router.post('/', wrapAsync(createBlog));
router.put('/:id', wrapAsync(updateBlog));
router.delete('/:id', wrapAsync(deleteBlog));

export default router;
