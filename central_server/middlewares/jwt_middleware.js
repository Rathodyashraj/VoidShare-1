// can be used as:
// router.get("/check", protectRoute, checkAuth)\
// protectRoute before performing any function checks if the request is coming from a logged in user
// User is mongodb database


// import jwt from "jsonwebtoken"
// import User from "../models/Users.js"
const jwt = require('jsonwebtoken');
const User = require('../models/Users.js');

export const protectRoute= async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Unauthorized- no token provided"});
        }

        const decoded= jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({message: "Unauthorized- invalid token"});
        }

        const user= await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user=user;
        
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}