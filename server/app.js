const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const authRouter = require('./controllers/authentController');
const userRouter = require('./controllers/userController')
const chatRouter = require('./controllers/chatController')
const messageRouter = require('./controllers/messageController') 

app.use(express.json( {limit: "50mb" }));

const corsOptions = {
    origin: 'https://chitchatty-app-client.onrender.com', // deployed frontend URL
    methods: ['GET', 'POST'],
    credentials: true
};
app.use(cors(corsOptions));

app.use('/api/auth', authRouter );
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)

// Create server
const server = http.createServer(app);

// Socket.io setup
const io = require('socket.io')(server, {
    cors: corsOptions
});

const onlineUser = []

//Test socket connection
io.on('connection', socket => {
    socket.on('join_room', userId =>{
        socket.join(userId);
    })

    socket.on('send_msg', (message) => {
        io.to(message.members[0]).to(message.members[1]).emit('recv_msg', message)

        io.to(message.members[0]).to(message.members[1]).emit('set_msg_count', message)
    })

    socket.on('clear_unread_msgs', data => {
        io.to(data.members[0]).to(data.members[1]).emit('msg_count_cleared', data)
    })

    socket.on('user_typing', (data) => {
        io.to(data.members[0]).to(data.members[1]).emit('typing_started', data)
    })

    socket.on('user_login', userId => {
        if(!onlineUser.includes(userId)){
            onlineUser.push(userId)
        }
        io.emit('all_online_users', onlineUser);
    })

    socket.on('user-logout', userId => {
        onlineUser.splice(onlineUser.indexOf(userId),1);
        io.emit('online_users_updated', onlineUser);
    })
})
module.exports = server;