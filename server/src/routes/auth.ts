import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';
import { signToken } from '../lib/jwt';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  const { name, email, password, exam, classLevel } = req.body as Record<string, string>;
  if (!name || !email || !password || !exam || !classLevel) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }
  const normalised = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalised } });
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalised, passwordHash, exam, classLevel },
  });
  // Seed game profile + subscription
  await Promise.all([
    prisma.gameProfile.create({ data: { userId: user.id } }),
    prisma.subscription.create({ data: { userId: user.id } }),
  ]);
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, exam: user.exam, classLevel: user.classLevel, examDate: user.examDate },
  });
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const normalised = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalised } });
  if (!user) {
    res.status(401).json({ error: 'No account found with that email.' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, exam: user.exam, classLevel: user.classLevel, examDate: user.examDate },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, exam: user.exam, classLevel: user.classLevel, examDate: user.examDate });
});

// PATCH /api/auth/exam-date
router.patch('/exam-date', requireAuth, async (req: AuthRequest, res: Response) => {
  const { examDate } = req.body as { examDate: string };
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { examDate: examDate ? new Date(examDate) : null },
  });
  res.json({ examDate: user.examDate });
});

export default router;
