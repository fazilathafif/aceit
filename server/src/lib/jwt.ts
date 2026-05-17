import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'fallback_secret';

export function signToken(payload: { userId: string; email: string; isAdmin?: boolean }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string; email: string; isAdmin?: boolean } {
  return jwt.verify(token, SECRET) as { userId: string; email: string; isAdmin?: boolean };
}
