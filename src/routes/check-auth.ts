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
      user_id: user.id,
      status: 'Vetbook_creation',
      user_type: user.role
    },
    200
  );
});

export default checkAuth;
