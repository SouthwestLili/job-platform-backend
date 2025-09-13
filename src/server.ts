import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import jobsRouter from './routes/jobs';

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(morgan('dev'));

// health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'job-platform-backend' });
});

// routes 
app.use('/api/jobs', jobsRouter);

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ code: 'INTERNAL_ERROR', message: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
