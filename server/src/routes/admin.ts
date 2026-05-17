import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';
import { signToken } from '../lib/jwt';
import { requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ── POST /api/admin/login ─────────────────────────────────────────────────────
// Works if user has isAdmin = true. Only admins can get an admin token.
router.post('/login', async (req, res: Response) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.isAdmin) {
    res.status(401).json({ error: 'Invalid credentials or insufficient privileges.' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials or insufficient privileges.' });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, isAdmin: true });
  res.json({ token, admin: { id: user.id, name: user.name, email: user.email } });
});

// ── POST /api/admin/make-first-admin ─────────────────────────────────────────
// Bootstraps the first admin account when there are zero admins in the DB.
// Disabled after any admin exists to prevent privilege escalation.
router.post('/make-first-admin', async (req, res: Response) => {
  const adminCount = await prisma.user.count({ where: { isAdmin: true } });
  if (adminCount > 0) {
    res.status(403).json({ error: 'Admin account already exists.' });
    return;
  }
  const { email, password, name } = req.body as Record<string, string>;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'name, email, and password are required.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Admin password must be at least 8 characters.' });
    return;
  }
  const normalised = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalised } });
  if (existing) {
    // Promote existing user to admin
    const updated = await prisma.user.update({
      where: { email: normalised },
      data: { isAdmin: true },
    });
    const token = signToken({ userId: updated.id, email: updated.email, isAdmin: true });
    res.json({ token, admin: { id: updated.id, name: updated.name, email: updated.email } });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalised, passwordHash, exam: 'NEET', classLevel: 'Both', isAdmin: true },
  });
  await Promise.all([
    prisma.gameProfile.create({ data: { userId: user.id } }),
    prisma.subscription.create({ data: { userId: user.id } }),
  ]);
  const token = signToken({ userId: user.id, email: user.email, isAdmin: true });
  res.status(201).json({ token, admin: { id: user.id, name: user.name, email: user.email } });
});

// ─── All routes below require admin token ────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const [totalUsers, premiumUsers, weeklySignups] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  res.json({ totalUsers, premiumUsers, weeklySignups });
});

// GET /api/admin/users?q=&page=1&limit=20
router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string) ?? '';
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1'));
  const limit = Math.min(100, parseInt((req.query.limit as string) ?? '20'));
  const skip = (page - 1) * limit;

  const where = {
    isAdmin: false,
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        exam: true,
        classLevel: true,
        createdAt: true,
        subscription: { select: { status: true, plan: true, currentPeriodEnd: true } },
        gameProfile: { select: { xp: true, streak: true, totalQuizzes: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/admin/users/:id
router.get('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, name: true, email: true, exam: true, classLevel: true,
      examDate: true, isAdmin: true, createdAt: true,
      subscription: true,
      gameProfile: true,
      _count: { select: { quizHistory: true, revisionQueue: true, bookmarks: true } },
    },
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

// PATCH /api/admin/users/:id  — edit name / email / exam / classLevel
router.patch('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, email, exam, classLevel } = req.body as Record<string, string>;
  const data: Record<string, string> = {};
  if (name) data.name = name.trim();
  if (email) data.email = email.trim().toLowerCase();
  if (exam) data.exam = exam;
  if (classLevel) data.classLevel = classLevel;
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ id: user.id, name: user.name, email: user.email, exam: user.exam, classLevel: user.classLevel });
});

// PATCH /api/admin/users/:id/password  — reset password
router.patch('/users/:id/password', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { newPassword } = req.body as { newPassword: string };
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
  res.json({ ok: true });
});

// PATCH /api/admin/users/:id/subscription  — manually set status/plan
router.patch('/users/:id/subscription', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status, plan } = req.body as { status: string; plan?: string };
  const sub = await prisma.subscription.upsert({
    where: { userId: req.params.id },
    update: { status, plan: plan ?? null, updatedAt: new Date() },
    create: { userId: req.params.id, status, plan: plan ?? null },
  });
  res.json(sub);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// POST /api/admin/users  — create a test/demo user
router.post('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, email, password, exam, classLevel, isPremium, plan } =
    req.body as Record<string, string> & { isPremium?: boolean };
  if (!name || !email || !password || !exam || !classLevel) {
    res.status(400).json({ error: 'name, email, password, exam, and classLevel are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }
  const normalised = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalised } });
  if (existing) {
    res.status(409).json({ error: 'A user with this email already exists.' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalised, passwordHash, exam, classLevel },
  });
  await Promise.all([
    prisma.gameProfile.create({ data: { userId: user.id } }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        status: isPremium ? 'active' : 'free',
        plan: isPremium ? (plan ?? 'monthly') : null,
      },
    }),
  ]);
  res.status(201).json({
    id: user.id, name: user.name, email: user.email,
    exam: user.exam, classLevel: user.classLevel,
    createdAt: user.createdAt,
    subscription: { status: isPremium ? 'active' : 'free', plan: isPremium ? (plan ?? 'monthly') : null, currentPeriodEnd: null },
    gameProfile: { xp: 0, streak: 0, totalQuizzes: 0 },
  });
});

// ── Plans ─────────────────────────────────────────────────────────────────────

const DEFAULT_PLANS = [
  {
    name: 'Free',
    billingCycle: 'free',
    priceUsd: 0,
    sortOrder: 0,
    features: [
      'Unlimited basic quizzes',
      'Flashcards (10 cards/day)',
      'Daily challenge',
      'Stats overview',
    ],
  },
  {
    name: 'Monthly',
    billingCycle: 'monthly',
    priceUsd: 4.99,
    sortOrder: 1,
    features: [
      'Everything in Free',
      'Full mock tests (JEE / NEET)',
      'AI Tutor (Claude-powered)',
      'AI Study Path & schedule',
      'Analytics Trends charts',
      'Speed Round & 1v1 Duel',
      'Social leaderboard',
      'Formula sheets & concepts',
      'Unlimited revision queue',
    ],
  },
  {
    name: 'Yearly',
    billingCycle: 'yearly',
    priceUsd: 39.99,
    sortOrder: 2,
    features: [
      'Everything in Monthly',
      '2 months free vs monthly',
      'Priority support',
    ],
  },
];

// GET /api/admin/plans  — list all plans; seed defaults if none exist
router.get('/plans', requireAdmin, async (_req: AuthRequest, res: Response) => {
  let plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
  if (plans.length === 0) {
    plans = await Promise.all(
      DEFAULT_PLANS.map((p) => prisma.plan.create({ data: p })),
    );
  }
  // Attach subscriber counts
  const subs = await prisma.subscription.groupBy({
    by: ['plan', 'status'],
    _count: true,
  });
  const countMap: Record<string, number> = {};
  for (const s of subs) {
    if (s.status === 'active' && s.plan) countMap[s.plan] = (countMap[s.plan] ?? 0) + s._count;
  }
  const freeCount = await prisma.subscription.count({ where: { status: 'free' } });
  const result = plans.map((p) => ({
    ...p,
    subscriberCount: p.billingCycle === 'free' ? freeCount : (countMap[p.billingCycle] ?? 0),
  }));
  res.json(result);
});

// POST /api/admin/plans  — create a new plan
router.post('/plans', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, billingCycle, priceUsd, features, stripePriceId, sortOrder } =
    req.body as { name: string; billingCycle: string; priceUsd: number; features?: string[]; stripePriceId?: string; sortOrder?: number };
  if (!name || !billingCycle || priceUsd === undefined) {
    res.status(400).json({ error: 'name, billingCycle, and priceUsd are required.' });
    return;
  }
  const plan = await prisma.plan.create({
    data: { name, billingCycle, priceUsd, features: features ?? [], stripePriceId: stripePriceId ?? null, sortOrder: sortOrder ?? 0 },
  });
  res.status(201).json(plan);
});

// PATCH /api/admin/plans/:id  — update plan
router.patch('/plans/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, billingCycle, priceUsd, features, isActive, stripePriceId, sortOrder } = req.body as {
    name?: string; billingCycle?: string; priceUsd?: number; features?: string[];
    isActive?: boolean; stripePriceId?: string; sortOrder?: number;
  };
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (billingCycle !== undefined) data.billingCycle = billingCycle;
  if (priceUsd !== undefined) data.priceUsd = priceUsd;
  if (features !== undefined) data.features = features;
  if (isActive !== undefined) data.isActive = isActive;
  if (stripePriceId !== undefined) data.stripePriceId = stripePriceId;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  const plan = await prisma.plan.update({ where: { id: req.params.id }, data });
  res.json(plan);
});

// DELETE /api/admin/plans/:id
router.delete('/plans/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.plan.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
