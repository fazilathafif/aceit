import { Router, Response } from 'express';
import prisma from '../lib/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/game
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  let profile = await prisma.gameProfile.findUnique({ where: { userId: req.userId } });
  if (!profile) {
    profile = await prisma.gameProfile.create({ data: { userId: req.userId! } });
  }
  res.json(profile);
});

// PUT /api/game  — full upsert of game profile
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const data = req.body as {
    xp?: number; streak?: number; lastActiveDate?: string; freezeTokens?: number;
    earnedBadgeIds?: string[]; totalQuizzes?: number; perfectQuizzes?: number;
    highAccuracyQuizzes?: number; breathingCompleted?: number; moodCheckDays?: number;
    mockTestsTaken?: number;
  };
  const profile = await prisma.gameProfile.upsert({
    where: { userId: req.userId },
    update: { ...data },
    create: { userId: req.userId!, ...data },
  });
  res.json(profile);
});

export default router;
