const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectToMongo = require("./connect");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const fileRoute = require("./routes/file");
const messageRoute = require("./routes/message");

dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT, 10) || 8003;

// Add MongoDB connection
const MONGODB_URL = process.env.MONGODB_URI;;
connectToMongo(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('code-change', ({ roomId, code, fileChanged }) => {
        socket.to(roomId).emit('code-update', { code, fileChanged });
    });

    socket.on('join-chat', (roomId) => {
        socket.join(`chat-${roomId}`);
        console.log(`User ${socket.id} joined chat room ${roomId}`);
    });

    socket.on('send-message', ({ roomId, message }) => {
        socket.to(`chat-${roomId}`).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/room', roomRoute);
app.use('/file', fileRoute);
app.use('/message', messageRoute);

// Only start the server after MongoDB connection is established
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});