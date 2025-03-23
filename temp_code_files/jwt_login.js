// code when user logins, check the email and pwd from the database and geenrates a jwt token
// User is mongodb database


export const login=async (req,res)=>{
    // taking email and password from the user
    const { email, password } = req.body;

    try{
        // getting the user with email id 'email'
        const user = await User.findOne({ email });

        // user doesnt exist
        if (!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        // if user exists check for passwd
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        // passwd for the email doesnt match
        if (!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        // if everything is correct generate JWT
        generateToken(user._id, res)

        // details send back to the client
        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic,    
        })

    } catch (error){
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

s

// token generation

import jwt from "jsonwebtoken"

// Generates a json web token
export const generateToken = (userId, res) =>{
    const token = jwt.sign({userId},process.env.JWT_SECRET, { expiresIn : "7d"})

    res.cookie("jwt",token,{
        expiresIn : 7 * 24 * 60 * 60, // 7 days in milliseconds
        httpOnly : true, // Prevents client-side JavaScript from accessing the cookie
        sameSite : true, // Prevents cross-site request forgery (CSRF) attacks
        secure : process.env.NODE_ENV !== "development", // Sends the cookie only over HTTPS in production
    })
    return token;
}