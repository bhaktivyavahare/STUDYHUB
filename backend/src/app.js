const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet());
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server, curl, Postman, mobile)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    const allowed = (process.env.FRONTEND_URL || '')
      .split(',')
      .map(o => o.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    // 1. Check if configured in FRONTEND_URL or wildcard
    if (allowed.includes('*') || allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // 2. Allow any localhost / 127.0.0.1 port (dev)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // 3. Automatically allow all Netlify domains (*.netlify.app)
    if (/^https:\/\/[a-zA-Z0-9-]+\.netlify\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/engage', engagementRoutes);
app.use('/api/users', userRoutes);

// Root Route (for Render / load balancer health ping & browser checks)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'StudyHub API is live and running',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
