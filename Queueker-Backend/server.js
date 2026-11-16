require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { getAllowedOrigins } = require('./src/config/origins');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const queueRoutes = require('./src/routes/queueRoutes');
const tokenRoutes = require('./src/routes/tokenRoutes');

// Import middleware
const errorHandler = require('./src/middleware/error');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Allowed origins — set CORS_ORIGINS and/or ALLOWED_ORIGIN (comma-separated).
// Defaults to the local dev origins when neither is set. See src/config/origins.js
const allowedOrigins = getAllowedOrigins();
console.log('CORS allowed origins:', allowedOrigins.join(', '));

// Setup WebSocket Server
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Make `io` accessible inside REST controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/tokens', tokenRoutes);

// Base route for healthcheck / API check
app.get('/', (req, res) => {
    res.json({ message: 'Queueker API is running!', status: 'OK' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'Queueker API is running!', status: 'OK' });
});

// Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Queueker Backend running on port ${PORT}`);
});
