const router = require('express').Router();
const authmiddleware = require('./../middleware/authmiddleware');
const Chat = require('./../models/chat');
const Message = require('../models/message');

router.post('/new-message', authmiddleware, async (req,res) => {
    try{
        //stor msg in msg collection
        const newMsg = new Message(req.body);
        const savedMsg = await newMsg.save();

        const currentChat = await Chat.findOneAndUpdate({
            _id: req.body.chatId 
        },{
            lastMessage: savedMsg._id,
            $inc: {unreadmsgCount: 1}
        });

        res.status(201).send({
            message: 'Message sent successfully',
            success: true,
            data: savedMsg
        })

    }catch(error){
        res.status(400).send({
            message : error.message,
            success : false 
        })
    }
}) 

router.get('/get-all-messages/:chatId',authmiddleware,async (req, res) =>{
    try{
        const allMessages = await Message.find({chatId: req.params.chatId})
                                        .sort ({createdAt: 1});
        res.send({
            message : 'Messages fetched successfully',
            success: 'true',
            data: allMessages
        })
    }catch(error){
        res.status(400).send({
            message : error.message,
            success: false
        })
    }
})
module.exports = router;