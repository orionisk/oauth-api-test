import { sign, verify } from 'hono/jwt';
import { randomUUID } from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not set');
}

interface TokenPayload {
  userId: string;
  sessionId?: string;
}

export async function generateTokens(userId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}> {
  const sessionId = randomUUID();
  const payload = { userId, sessionId };

  const accessToken = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1h in seconds
    },
    JWT_ACCESS_SECRET,
    'HS256'
  );

  const refreshToken = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7d in seconds
    },
    JWT_REFRESH_SECRET,
    'HS256'
  );

  return { accessToken, refreshToken, sessionId };
}

export async function verifyToken(
  token: string,
  isRefreshToken = false
): Promise<TokenPayload> {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_ACCESS_SECRET;
    const decoded = (await verify(
      token,
      secret,
      'HS256'
    )) as unknown as TokenPayload;

    if (!decoded.userId || !decoded.sessionId) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
    throw error;
  }
}
