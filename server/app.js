const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const authRouter = require('./controllers/authentController');
const userRouter = require('./controllers/userController')
const chatRouter = require('./controllers/chatController')
const messageRouter = require('./controllers/messageController') 

app.use(express.json({ limit: "50mb" }));

// CORS configuration
const allowedOrigin = 'https://chitchatty-app-client.onrender.com';
const corsOptions = {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allow all needed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Enable CORS
app.use(cors(corsOptions));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// Create server
const server = http.createServer(app);

// Socket.io setup
const io = require('socket.io')(server, {
    cors: corsOptions
});

// Keep track of online users
const onlineUser = [];

io.on('connection', socket => {
    socket.on('join_room', userId => {
        socket.join(userId);
    });

    socket.on('send_msg', message => {
        io.to(message.members[0]).to(message.members[1]).emit('recv_msg', message);
        io.to(message.members[0]).to(message.members[1]).emit('set_msg_count', message);
    });

    socket.on('clear_unread_msgs', data => {
        io.to(data.members[0]).to(data.members[1]).emit('msg_count_cleared', data);
    });

    socket.on('user_typing', data => {
        io.to(data.members[0]).to(data.members[1]).emit('typing_started', data);
    });

    socket.on('user_login', userId => {
        if (!onlineUser.includes(userId)) onlineUser.push(userId);
        socket.emit('all_online_users', onlineUser);
        socket.broadcast.emit('online_users_updated', onlineUser);
    });

    socket.on('user-logout', userId => {
        const index = onlineUser.indexOf(userId);
        if (index > -1) onlineUser.splice(index, 1);
        io.emit('online_users_updated', onlineUser);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

module.exports = server;
