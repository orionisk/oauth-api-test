import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config';
import { authRouter } from './routes/auth';
import { authMiddleware } from './middleware/auth';
import checkAuth from './routes/check-auth';

const app = new Hono();

app.use(
  cors({
    origin: origin => {
      return !origin || origin.startsWith('http://localhost:') ? origin : null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
);

app.get('/', c => c.text('Health check OK'));
// app.route('/api/auth/v1/authentication', authRouter);
app.route('', authRouter);

app.use('/api/*', authMiddleware);
app.route('/api/auth/v1/authentication/get-status', checkAuth);

serve(app, () => {
  console.log(`Server is running on port ${config.port}`);
});
