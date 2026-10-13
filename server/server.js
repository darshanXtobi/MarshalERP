import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import examRoutes from './routes/exams.js';
import feeRoutes from './routes/fees.js';
import transportRoutes from './routes/transport.js';
import academicRoutes from './routes/academics.js';
import liveRoutes from './routes/live.js';
import { initWebSocketServer } from './services/websocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for both Staff ERP and Learner Portal frontends
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'EPS-TOKEN', 'x-access-token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/live', liveRoutes);

// Compatibility aliases for legacy EduPlusCampus endpoints discovered in student rp
app.use('/AppLoginNew', authRoutes);
app.use('/appLogin', authRoutes);
app.use('/appLearnerAcademics', attendanceRoutes);
app.use('/AppLearnerExamination', examRoutes);
app.use('/OnlinePayments', feeRoutes);
app.use('/Transport', transportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Marshal College ERP & Learner Portal Engine',
    timestamp: new Date().toISOString()
  });
});

// Initialize real-time WebSocket live sync
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MARSHAL ERP AUTHORITATIVE BACKEND & LIVE ENGINE     `);
  console.log(`  Listening on HTTP: http://localhost:${PORT}        `);
  console.log(`  WebSocket Stream:  ws://localhost:${PORT}/api/ws/live`);
  console.log(`=======================================================`);
});

export default app;
