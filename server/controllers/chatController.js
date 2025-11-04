const router = require('express').Router();
const authmiddleware = require('./../middleware/authmiddleware');
const Chat = require('./../models/chat');
const Message = require('./../models/message');

router.post('/create-new-chat',authmiddleware, async (req,res) =>{
    try{
        const chat = new Chat(req.body);
        const savedChat = await chat.save()

        await savedChat.populate('members'); 

        res.status(201).send({
            message : 'Chat created successfully',
            success : true,
            data : savedChat
        })
    }catch(error){
        resizeBy.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.get('/get-all-chats',authmiddleware, async (req,res) =>{
    try{
        const allChats = await Chat.find({members: {$in: req.userId}}).populate('members').populate('lastMessage').sort({updatedAt : -1});

        res.status(200).send({
            message : 'All Chats fetched successfully',
            success : true,
            data : allChats
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.post('/clear-unread-msg', authmiddleware, async (req, res) => {
    try{
        const chatId = req.body.chatId;

        // update unread msg count
        const chat = await Chat.findById(chatId);
        if(!chat){
            res.send({
                message : "No Chat found with given chat ID",
                success: false
            })
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {unreadmsgCount: 0},
            { new: true}
        ).populate('members').populate('lastMessage');
    
        // update read property
        await Message.updateMany(
            {chatId: chatId, read : false},
            { read : true }
        )

        res.send({
            message : "Unread messages cleared successfully",
            success : true,
            data : updatedChat
        })

    }catch(error){
        res.send({
            message: error.message,
            success: false
        })
    }
})

module.exports = router;