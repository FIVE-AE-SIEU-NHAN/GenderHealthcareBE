import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog,getBlogDetail,
    likeBlog,
    commentBlog,
    getComments,getCommentLikers
    } from '../controllers/blog.controller';
import { wrapAsync } from '~/utils/handler'

const router = express.Router();

router.get('/', wrapAsync(getAllBlogs));
router.get('/:id', wrapAsync(getBlogById));
router.post('/', wrapAsync(createBlog));
router.put('/:id', wrapAsync(updateBlog));
router.delete('/:id', wrapAsync(deleteBlog));

router.post('/:id/view', wrapAsync(getBlogDetail));
router.post('/:id/like', wrapAsync(likeBlog));
router.post('/:id/comments', wrapAsync(commentBlog));
router.get('/:id/comments', wrapAsync(getComments));
router.get('/comments/:id/likers', wrapAsync(getCommentLikers)); 
export default router;
