const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true, 
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8
    },

    profilePic: {
        type: String,
        required: false
    }
}, {timestamps: true})

module.exports = mongoose.model('users', userSchema);