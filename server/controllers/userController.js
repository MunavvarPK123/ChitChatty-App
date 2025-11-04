const router = require('express').Router();
const User = require('./../models/user')
const authMiddleware = require('./../middleware/authmiddleware')
const message = require('../models/message');
const cloudinary = require('./../cloudinary')

//GET Detls of current logged-in user
router.get('/get-logged-user', authMiddleware, async(req,res) => {
    try{
        const user = await User.findOne({_id : req.userId})

        res.send({
            message: 'User fetched successfully!',
            success: true,
            data: user
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.get('/get-all-users', authMiddleware, async(req,res) => {
    try{
        const userid = req.userId;
        const allUsers = await User.find({_id: {$ne : userid}});

        res.send({
            message: 'All users fetched successfully!',
            success: true,
            data: allUsers
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.post('/upload_prof_pic', authMiddleware , async( req, res) => {
    try{
        const image = req.body.image;

        //Upload img to cloudinary
        const uploadedImage = await cloudinary.uploader.upload( image, {
            folder : 'ChitChatty'
        })

        //update user model and set prof pic
        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePic: uploadedImage.secure_url},
            { new: true}
        );
        res.send({
            message: 'Profile Pic Uploaded Successfully',
            success : true,
            data : user
        })
    }catch(error){
        res.send({
            message : error.message,
            success: false
        })
    }
})
module.exports = router;