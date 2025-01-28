import { createMiddleware } from 'hono/factory';
import type { User } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { getAuthCookies, getAuthenticatedUser, refreshUserSession } from '../lib/auth-utils';

export const authMiddleware = createMiddleware<{
  Variables: {
    user: User;
  };
}>(async (c, next) => {
  const { accessToken, refreshToken, sessionId } = getAuthCookies(c);

  if (!refreshToken || !sessionId) {
    return c.json({ error: 'No refresh token or session ID provided' }, 401);
  }

  try {
    let user: User;

    if (accessToken) {
      const { userId } = await verifyToken(accessToken, false);
      user = await getAuthenticatedUser(userId);
    } else {
      user = await refreshUserSession(c, refreshToken);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === 'Token expired' && refreshToken) {
      try {
        const user = await refreshUserSession(c, refreshToken);
        c.set('user', user);
        await next();
      } catch (refreshError) {
        return c.json({ error: 'Session expired' }, 401);
      }
    } else {
      return c.json({ error: 'Invalid token' }, 401);
    }
  }
});
