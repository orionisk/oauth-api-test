import { Hono } from 'hono';
import type { User } from '@prisma/client';

type Variables = {
  user: User;
};

const checkAuth = new Hono<{ Variables: Variables }>();

checkAuth.get('/', async c => {
  const user = c.get('user');
  return c.json(
    {
      role: user.role.toLowerCase()
    },
    200
  );
});

export default checkAuth;
