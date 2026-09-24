import express from 'express';
import cors from 'cors';
import projectsRouter from './modules/projects/projects.controller';
import racksRouter from './modules/racks/racks.controller';
import devicesRouter from './modules/devices/devices.controller';
import connectionsRouter from './modules/connections/connections.controller';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Register API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/racks', racksRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/connections', connectionsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RackDraw Backend API' });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`[server]: RackDraw Backend running at http://localhost:${port}`);
});
