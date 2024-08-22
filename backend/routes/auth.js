const express = require('express');
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const router = express.Router()
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const JWT_SECRET = "kishanisa$goodboy"
var fetchuser = require("../middleware/fetchuser");


// ROUTE:1 CREATE A USER USING : POST  "/api/auth/createuser"  LOGIN NOT REQUIRED
router.post('/createuser', [
    body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'password atleast must be five characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;

    // IF THERE ARE ERROR OCCURED , RETURN THE BAD REQUEST
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success , errors: errors.array() });
    }

    // CHECK WHETHER THE USER WITH THIS EMAIL IS ALREADY EXIST
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success , error: "Sorry a user with this email is already exits" })
        }
    const salt = await bcrypt.genSalt(10);
       secPass = await bcrypt.hash(req.body.password , salt)
        // CREATE A NEW USER
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user : {
             id :user.id  
            }
        }
       const authToken = jwt.sign(data,JWT_SECRET)
       success = true ; 
       res.json({  success ,  authToken})
       
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
    }
})


// ROUTE:2 AUTHENTICATE A USER USING : POST  "/api/auth/login"  LOGIN NOT REQUIRED

router.post('/login', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'password can not be blank').exists(),
], async (req, res) => {
    // IF THERE ARE ERROR OCCURED , RETURN THE BAD REQUEST
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email , password}  = req.body;
    try {
        let user = await User.findOne({email});
        if(!user) {
           return res.status(400).json({error:"please try to login with current credentials"})
        }
        const passwordCompare = await bcrypt.compare(password , user.password)
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success , error:"please try to login with current credentials"})
        }
        const data = {
            user : {
             id :user.id  
            }
        }
        const authToken = jwt.sign(data,JWT_SECRET)
        success = true;
        res.json({ success,authToken})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
    }

})

// ROUTE:3 GET LOGIN USER DETAILS WITH : POST  "/api/auth/getuser"  LOGIN  REQUIRED

router.post('/getuser', fetchuser , async (req, res) => {
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
   
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
}
})

module.exports = router