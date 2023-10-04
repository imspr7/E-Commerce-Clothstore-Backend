const express = require('express');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authUser = require('../middleware/authUser');
const dotenv = require('dotenv');
const { deleteAllUserData } = require('../controller/deleteUser');
dotenv.config()


// create a user :post "/auth",!auth
let success = false
router.post('/register', [

    body('firstName', 'Enter a valid name').isLength({ min: 1 }),
    body('lastName', 'Enter a valid name').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('phoneNumber', 'Enter a valid phone number').isLength({ min: 10, max: 10 })


], async (req, res) => {

    // res.c
    console.log("regis api calling ---",req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        return res.status(400).json({ error: errors.array() })
    }
    const { firstName, lastName, email, phoneNumber, password } = req.body

    try {
        console.log("inside ---",req.body);
        let user = await User.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
        console.log("user ---",user);
        if (user) {
            return res.status(400).send({ error: "Sorry a user already exists" })
        }

        // password hashing
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)
        console.log("password hashing---",secPass);
      let  isAdmin=false;
        console.log("isAdmin---",isAdmin);
        // create a new user
        user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: secPass,
            isAdmin
        })
        console.log("user created ---",user);
        const data = {
            user: {
                id: user.id
            }
        }
        success = true
        console.log("sucess---",success);
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        res.send({ success, authToken })
       
    }
    catch (error) {
        res.status(500).send("Internal server error")
    }
})


// login Route
router.post('/login', [

    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }

    const { email, password, } = req.body;
    try {
        let user = await User.findOne({ email });
        console.log(email);
        if (!user) {

            return res.status(400).send({ success, error: "User not found" })
        }
        console.log(user);
        console.log("req pas",password)
        console.log("db pass",user.password)
        const passComp = await bcrypt.compare(password, user.password)
        console.log("passComp",passComp)
        if (!passComp) {
            return res.status(400).send({ success, error: "Please try to login with correct credentials" })
        }
        console.log(user._id);
        const data = {
            user: {
                id: user._id
            }
        }
        console.log(email,user);
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        success = true
        res.send({ success, authToken })
    }
    catch (error) {
        res.status(500).send("Internal server error002")
    }
}
);
// logged in user details

router.get('/getuser', authUser, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select("-password")
        success = true
        res.send(user)
        console.log(user.city);


    } catch (error) {
        res.status(400).send("Something went wrong")
    }
}
)


// update user details
router.put('/updateuser', authUser, async (req, res) => {
    const { userDetails } = req.body
    let convertData = JSON.parse(userDetails)
    try {
        const user = await User.findById(req.user.id)
        if (user) {
            let updateDetails = await User.findByIdAndUpdate(req.user.id, { $set: convertData })
            success = true
            res.status(200).send({ success })
        }
        else {
            return res.status(400).send("User Not Found")
        }
    } catch (error) {
        res.send("Something went wrong")
    }
})

// delete user and user data
router.delete('/delete/user/:userId', authUser, deleteAllUserData)
module.exports = router