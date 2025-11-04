const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user')

router.post('/signup', async (req,res) => {
    const {firstname, lastname, email, password } = req.body;
        
        // Check required fields
        if(!firstname && !lastname && !email && !password) {
            return res.status(400).send({
                message: 'All fields are required',
                success: false
            });
        }

        if(!firstname){
            return res.status(400).send({
                message: 'First name is required',
                success: false
            });
        }

        else if(!lastname){
            return res.status(400).send({
                message: 'Last name is required',
                success: false
            });
        }

        else if(!email){
            return res.status(400).send({
                message: 'Email is required',
                success: false
            });
        }

        //if user already exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        //if user exists, send an error response
        if(existingUser){
            return res.status(400).send({
                message: 'This email is already registered. Try log in instead.',
                success: false
            });
        }

        //validate the email
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).send({
                message: "Please enter a valid email address",
                success: false
            });
        }

        if(!password){ 
            return res.status(400).send({ 
                message: 'Password is required', 
                success: false 
            });
        }

        //validate the password
        if(!/^[a-zA-Z0-9]{8,}$/.test(password)){
            return res.status(400).send({ 
                message: "Password must be at least 8 characters and contain only letters and numbers", 
                success: false 
            });
        }

        //encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user, save in DB
        const newUser = new User({firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();
        
        res.status(201).send({
            message: 'User account has been created',
            success: true
        });
})

router.post('/login', async (req,res) => {
    try{
        //Check if user exists
        const user = await User.findOne({email: req.body.email}).select("+password");
        if(!user){
            return res.status(400).send({
                message: 'User does not exist',
                success: false
            })
        }
        console.log("req.body:", req.body);
        console.log("req.body.password:", req.body.password);
        console.log("user.password:", user.password);

        //Check if password is correct
        const isValid = await bcrypt.compare(req.body.password, user.password)
        if(!isValid){
            return res.status(400).send({
                message: 'Invalid Password',
                success: false
            })
        }

        //If user exists & password correct, assign a JWT
        const token = jwt.sign({userId : user._id}, process.env.SECRET_KEY, {expiresIn: "1d"});
        res.send({
            message : 'User logged-in successfully!',
            success: true,
            token: token
        });
    
    }catch(error){
        res.send({
            message: error.message,
            success:false
        })
    }

})

module.exports = router;