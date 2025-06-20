import express from 'express';
import { createCycle, getUserCycles } from '../controllers/cycle.controller';
const router = express.Router();

router.post('/', createCycle);
router.get('/:userId', getUserCycles);

export default router;
