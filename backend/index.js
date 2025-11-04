require('dotenv').config();

const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectToMongo = require("./connect");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const fileRoute = require("./routes/file");
const messageRoute = require("./routes/message");
const uploadRoute = require("./routes/upload");
const authenticate = require("./middlewares/auth");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT, 10);

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URI;
connectToMongo(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const io = new Server(httpServer, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN,
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


app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.send("Editron backend is live 🚀");
});

app.use('/auth', authRoute);
app.use('/room', authenticate, roomRoute);
app.use('/file', authenticate, fileRoute);
app.use('/message', authenticate, messageRoute);
app.use('/upload', authenticate, uploadRoute);

// Only start the server after MongoDB connection is established
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});