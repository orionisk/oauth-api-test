export const config = {
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookies: {
    access: {
      name: 'access_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    },
    refresh: {
      name: 'refresh_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    },
    session: {
      name: 'sessionId',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!
    }
    // facebook: {
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    //   redirectUri:
    //     process.env.FACEBOOK_REDIRECT_URI ||
    //     'http://localhost:3000/auth/facebook/callback'
    // },
    // apple: {
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   teamId: process.env.APPLE_TEAM_ID!,
    //   keyId: process.env.APPLE_KEY_ID!,
    //   privateKey: process.env.APPLE_PRIVATE_KEY!,
    //   redirectUri:
    //     process.env.APPLE_REDIRECT_URI ||
    //     'http://localhost:3000/auth/apple/callback'
    // }
  }
  // twilio: {
  //   accountSid: process.env.TWILIO_ACCOUNT_SID!,
  //   authToken: process.env.TWILIO_access_token!,
  //   serviceSid: process.env.TWILIO_SERVICE_SID!
  // }
};
