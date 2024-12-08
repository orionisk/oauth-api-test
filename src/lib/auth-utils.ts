import { getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import type { User } from '@prisma/client';
import { prisma } from './db';
import { verifyToken, generateTokens } from './jwt';
import { config } from '../config';

export type AuthCookies = {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  sessionId: string | undefined;
};

export async function getAuthenticatedUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return user;
}

export async function refreshUserSession(
  c: Context,
  refreshToken: string
): Promise<User> {
  const { userId } = await verifyToken(refreshToken, true);
  const user = await getAuthenticatedUser(userId);

  const { accessToken: newAccessToken } = await generateTokens(userId);
  setCookie(
    c,
    config.cookies.access.name,
    newAccessToken,
    config.cookies.access
  );

  return user;
}

export function getAuthCookies(c: Context): AuthCookies {
  return {
    accessToken: getCookie(c, config.cookies.access.name),
    refreshToken: getCookie(c, config.cookies.refresh.name),
    sessionId: getCookie(c, config.cookies.session.name)
  };
}
