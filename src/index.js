import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import { Server } from 'socket.io';
import connectDB from './lib/connectDB.js';
import authRoutes from './routes/authRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import betRoutes from './routes/betRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { attachUser } from './middleware/auth.js';
import { seedAdmin, seedDemo } from './seed.js';
import { setIO } from './lib/socket.js';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL ?? '*' }
});
setIO(io);

// middleware
app.use(cors({ origin: process.env.CLIENT_URL ?? '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use(attachUser);

// routes
app.use('/api', authRoutes);
app.use('/api', matchRoutes);
app.use('/api', questionRoutes);
app.use('/api', betRoutes(io));
app.use('/api', walletRoutes);
app.use('/api', settingsRoutes);
app.use('/api/admin', adminRoutes);
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';
app.use('/api/payment-methods', paymentMethodRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));


// socket events
import Question from './models/Question.js';
io.on('connection', (socket) => {
  socket.on('join:match', (matchId) => socket.join(`match:${matchId}`));
  socket.on('timer:update', async ({ questionId, timerSeconds }) => {
    if (!questionId || typeof timerSeconds !== 'number') return;
    await Question.findByIdAndUpdate(questionId, { timerSeconds });
    // Broadcast to all clients (could be room-based for optimization)
    io.emit('timer:update', { questionId, timerSeconds });
  });
  socket.on('disconnect', () => {});
});
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDB(process.env.MONGO_URI);
  await seedAdmin();
  await seedDemo();
  console.log(`API running on ${PORT}`);
  // start auto-lock scheduler: close template questions autoLockBeforeMinutes before matchTime
  const runAutoLockJob = async () => {
    try {
      const Question = (await import('./models/Question.js')).default;
      const now = Date.now();
      const qs = await Question.find({ autoLockBeforeMinutes: { $ne: null }, status: 'open' }).populate('matchId', 'matchTime');
      for (const q of qs) {
        const match = q.matchId;
        if (!match || !match.matchTime) continue;
        const lockBeforeMs = (q.autoLockBeforeMinutes || 0) * 60 * 1000;
        const matchTimeMs = new Date(match.matchTime).getTime();
        if (matchTimeMs - now <= lockBeforeMs) {
          await Question.findByIdAndUpdate(q._id, { status: 'closed' });
          io.emit('question:update', { questionId: q._id, status: 'closed' });
        }
      }
    } catch (err) {
      console.error('Auto-lock job error', err);
    }
  };

  // run immediately and then every 30 seconds
  runAutoLockJob();
  setInterval(runAutoLockJob, 30 * 1000);
});
