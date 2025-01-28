import { config } from '../config';
import { prisma } from '../lib/db';
import { Provider, Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { generateTokens } from '../lib/jwt';

const googleClient = new OAuth2Client(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.redirectUri
);

async function createOrUpdateUser(data: {
  email?: string;
  phoneNumber?: string;
  name?: string;
  role?: Role;
  provider?: Provider;
  providerId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  const { provider, providerId, role = 'Specialist', ...userData } = data;

  if (provider && providerId) {
    return prisma.user.upsert({
      where: {
        provider_providerId: { provider, providerId }
      },
      update: { ...userData, role },
      create: { ...userData, provider, providerId, role }
    });
  }

  if (userData.email) {
    return prisma.user.upsert({
      where: { email: userData.email },
      update: { ...userData, role },
      create: { ...userData, role }
    });
  }

  if (userData.phoneNumber) {
    return prisma.user.upsert({
      where: { phoneNumber: userData.phoneNumber },
      update: { ...userData, role },
      create: { ...userData, role }
    });
  }

  throw new Error('Insufficient user data');
}

export async function handleGoogleAuth(state: string) {
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.redirectUri,
    response_type: 'code',
    scope: 'email profile openid',
    access_type: 'offline',
    prompt: 'consent',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function handleGoogleCallback(code: string) {
  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: config.oauth.google.clientId
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error('No payload from Google');

  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;

  const user = await createOrUpdateUser({
    email: payload.email!,
    name: payload.name,
    provider: Provider.GOOGLE,
    providerId: payload.sub,
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
    expiresAt
  });

  return generateTokens(user.id);
}

export async function refreshGoogleToken(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.refreshToken) throw new Error('No refresh token found');

  googleClient.setCredentials({
    refresh_token: user.refreshToken
  });

  const { credentials } = await googleClient.refreshAccessToken();

  return prisma.user.update({
    where: { id: userId },
    data: {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
    }
  });
}

export async function getUserGoogleProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.accessToken) throw new Error('No access token found');

  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${user.accessToken}`
    }
  });

  return response.json();
}
