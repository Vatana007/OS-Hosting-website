const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
    if (path.extname(req.path)) {
        res.sendFile(path.join(__dirname, '../frontend', req.path));
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n  ✅ Server running at: http://localhost:${PORT}`);
    console.log(`  📁 Frontend served from: /frontend`);
    console.log(`  🔌 API available at: /api\n`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
});