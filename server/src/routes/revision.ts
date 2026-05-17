import { Router, Response } from 'express';
import prisma from '../lib/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// ── Revision Queue ────────────────────────────────────────────────────────────

router.get('/queue', requireAuth, async (req: AuthRequest, res: Response) => {
  const items = await prisma.revisionItem.findMany({ where: { userId: req.userId } });
  res.json(items);
});

router.put('/queue', requireAuth, async (req: AuthRequest, res: Response) => {
  const items = req.body as {
    questionId: string; interval: number; easiness: number;
    repetitions: number; dueDate: string; addedDate: string;
  }[];
  // Bulk upsert
  await Promise.all(items.map((item) =>
    prisma.revisionItem.upsert({
      where: { userId_questionId: { userId: req.userId!, questionId: item.questionId } },
      update: { interval: item.interval, easiness: item.easiness, repetitions: item.repetitions, dueDate: item.dueDate },
      create: { userId: req.userId!, ...item },
    })
  ));
  res.json({ ok: true });
});

router.delete('/queue/:questionId', requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.revisionItem.deleteMany({
    where: { userId: req.userId, questionId: req.params.questionId },
  });
  res.json({ ok: true });
});

// ── Bookmarks ──────────────────────────────────────────────────────────────────

router.get('/bookmarks', requireAuth, async (req: AuthRequest, res: Response) => {
  const bookmarks = await prisma.bookmark.findMany({ where: { userId: req.userId } });
  res.json(bookmarks.map((b) => b.questionId));
});

router.post('/bookmarks', requireAuth, async (req: AuthRequest, res: Response) => {
  const { questionId } = req.body as { questionId: string };
  await prisma.bookmark.upsert({
    where: { userId_questionId: { userId: req.userId!, questionId } },
    update: {},
    create: { userId: req.userId!, questionId },
  });
  res.status(201).json({ ok: true });
});

router.delete('/bookmarks/:questionId', requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.bookmark.deleteMany({
    where: { userId: req.userId, questionId: req.params.questionId },
  });
  res.json({ ok: true });
});

// ── Error Notebook ─────────────────────────────────────────────────────────────

router.get('/errors', requireAuth, async (req: AuthRequest, res: Response) => {
  const errors = await prisma.errorNote.findMany({ where: { userId: req.userId } });
  res.json(errors.map((e) => e.questionId));
});

router.post('/errors', requireAuth, async (req: AuthRequest, res: Response) => {
  const { questionIds } = req.body as { questionIds: string[] };
  await Promise.all(questionIds.map((qid) =>
    prisma.errorNote.upsert({
      where: { userId_questionId: { userId: req.userId!, questionId: qid } },
      update: {},
      create: { userId: req.userId!, questionId: qid },
    })
  ));
  res.status(201).json({ ok: true });
});

router.delete('/errors/:questionId', requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.errorNote.deleteMany({
    where: { userId: req.userId, questionId: req.params.questionId },
  });
  res.json({ ok: true });
});

export default router;
