import express from 'express';
import multer from 'multer';
import path from 'path';
import { getAllBlogs, createBlog } from '../controllers/blog.controller';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/blogs', getAllBlogs);
router.post('/blogs', upload.single('image'), (req, res, next) => {
  Promise.resolve(createBlog(req, res)).catch(next);
});

export default router;
