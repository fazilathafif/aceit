import { Router, Response } from 'express';
import prisma from '../lib/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subscription
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  let sub = await prisma.subscription.findUnique({ where: { userId: req.userId } });
  if (!sub) {
    sub = await prisma.subscription.create({ data: { userId: req.userId! } });
  }
  res.json(sub);
});

// POST /api/subscription/checkout  — stub, returns mock checkout URL
router.post('/checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as { plan: 'monthly' | 'yearly' };
  // Stub: when Stripe is wired, this calls stripe.checkout.sessions.create
  // For now return a placeholder
  res.json({
    url: null,
    message: `Stripe checkout for ${plan} plan — add STRIPE_SECRET_KEY to enable`,
  });
});

// POST /api/subscription/portal  — stub
router.post('/portal', requireAuth, async (_req: AuthRequest, res: Response) => {
  res.json({ url: null, message: 'Stripe portal — add STRIPE_SECRET_KEY to enable' });
});

// POST /api/subscription/webhook  — Stripe webhook (stub)
router.post('/webhook', async (req, res: Response) => {
  // TODO: verify Stripe signature, handle events
  // stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  res.json({ received: true });
});

export default router;
