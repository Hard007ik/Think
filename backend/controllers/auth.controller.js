import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;
        
        const mailRgx =  /^[^\$@]+@[^\$@]+\.[^\$@]+$/
        if (!mailRgx.test(email)){
            return res.status(400).json({error: "Invalid email format"})
        }

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({error: "Username is already exists."})
        }
 
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({error: "Email is already exists."})
        }
        
        if (password.length < 6){
            return res.status(400).json({error: "Password must be at least 6 characters long!"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname: fullname,
            username: username,
            email: email,
            password: hashedPassword
        })

        if (newUser){
            // generate token and set cookie
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                coverImg: newUser.coverImg,
                profileImg: newUser.profileImg,
            })
        }
        else{
            res.status(400).json({error: "Invalid used data"})
        }

    } catch (err) {
        console.error("Error in signup controller", err)
        res.status(500).json({error: "Internal Server Error"})
    }
}


export const login = async (req, res) => {
    try {
        
        const { username, password } = req.body

        const user = await User.findOne({username})
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if (!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid username or password. if not have an account create first!"})
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })

    } catch (err) {
        console.log('Error in login controller', err)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge:0 })
        res.status(200).json({message: "Logged out successfully!"})
    } catch (err) {
        console.log("Error in logout controller", err)
        res.status(500).json({error:"Internal Server Error"})
    }
}

// get authenticate user- check if user authenticate or not
export const getMe = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (err) {
        console.log("Error in getMe controller", err)
        res.status(500).json({error: "Internal Server Error"})
    }
}