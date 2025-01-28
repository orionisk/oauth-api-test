import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { config } from '../config';
import { handleGoogleAuth, handleGoogleCallback } from '../services/auth';

export const authRouter = new Hono();

const handleGoogleAuthRequest = async (c: any) => {
  const clientUrl = c.req.header('referer') || config.clientUrl;
  const state = Buffer.from(JSON.stringify({ clientUrl })).toString('base64');
  const authUrl = await handleGoogleAuth(state);
  return c.redirect(authUrl);
};

authRouter.get('/api/auth/v1/authentication/google', handleGoogleAuthRequest);
authRouter.get('/api/auth/v1/authentication/google/', handleGoogleAuthRequest);

authRouter.get('/api/auth/google/callback', async c => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code) {
    return c.text('Authorization code is missing', 400);
  }

  try {
    const decodedState = Buffer.from(state || '', 'base64').toString();
    const { clientUrl } = JSON.parse(decodedState) || {
      clientUrl: config.clientUrl
    };

    const tokens = await handleGoogleCallback(code);
    const { accessToken, refreshToken, sessionId } = tokens;

    const cookies = [
      {
        name: config.cookies.access.name,
        value: accessToken,
        options: config.cookies.access
      },
      {
        name: config.cookies.refresh.name,
        value: refreshToken,
        options: config.cookies.refresh
      },
      {
        name: config.cookies.session.name,
        value: sessionId,
        options: config.cookies.session
      }
    ];

    cookies.forEach(({ name, value, options }) => {
      deleteCookie(c, name);
      setCookie(c, name, value, options);
    });

    return c.redirect(clientUrl);
  } catch (error) {
    console.error('Authentication error:', error);
    return c.text('Authentication failed', 401);
  }
});
