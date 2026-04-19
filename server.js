const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled so inline scripts & CDN resources work
  crossOriginEmbedderPolicy: false
}));

// Security: Rate limiting — general API (100 requests per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Security: Strict rate limit for auth routes (15 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login/signup attempts. Please try again after 15 minutes.' }
});

// Imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const leadRoutes = require('./routes/leadRoutes');
const db = require('./config/db');

// Security: Global input sanitization (XSS prevention)
const { sanitizeInputs } = require('./middleware/sanitize');
app.use(sanitizeInputs);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CONNECT ROUTES
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/leads', apiLimiter, leadRoutes);

// Static files
app.use(express.static('public'));

// Additional Routes
// Additional Routes
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});