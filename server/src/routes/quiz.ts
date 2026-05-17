import { Router, Response } from 'express';
import prisma from '../lib/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/quiz/history
router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const history = await prisma.quizHistory.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(history);
});

// POST /api/quiz/history
router.post('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const { date, subject, score, total, accuracy, wrongQuestionIds } = req.body as {
    date: string; subject: string; score: number; total: number;
    accuracy: number; wrongQuestionIds?: string[];
  };
  const entry = await prisma.quizHistory.create({
    data: { userId: req.userId!, date, subject, score, total, accuracy, wrongQuestionIds: wrongQuestionIds ?? [] },
  });
  res.status(201).json(entry);
});

// DELETE /api/quiz/history
router.delete('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.quizHistory.deleteMany({ where: { userId: req.userId } });
  res.json({ ok: true });
});

export default router;
