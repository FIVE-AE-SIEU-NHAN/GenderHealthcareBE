import express from 'express';
import multer from 'multer';
import { getAllBlogs, createBlog, getBlogById } from '../controllers/blog.controller';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// ✅ Không cần bọc Promise, chỉ cần để async controller trực tiếp là được:
router.get('/blogs', (req, res, next) => {
  getAllBlogs(req, res).catch(next);
});

router.get('/blogs/:id', (req, res, next) => {
  getBlogById(req, res).catch(next);
});

router.post('/blogs', upload.single('image'), (req, res, next) => {
  createBlog(req, res).catch(next);
});

export default router;
