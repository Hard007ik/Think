import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt // by the help of cookieParser() middleware in server file we can get cookie
        if(!token){
            return res.status(401).json({error: "Unauthorized: No Token Provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded){
            return res.status(401).json({error: "Unauthorized: Invalid Token"})
        }

        // console.log('decoded: ', decoded)
        // decoded:  {
        //     userid: '66c4ea44c89b414545af866b',
        //     iat: 1724181217,
        //     exp: 1724267617
        //   }
        // console.log("userID", decoded.userid)

        const user = await User.findById(decoded.userid).select("-password") // only return username no password
        
        if (!user) {
            return res.status(404).json({error: "User not found"})
        }

        req.user = user
        next()
    } catch (err) {
        console.log("Error in protectRoute middleware", err.message)
        return res.status(500).json({error: "Internal Server Error"})
    }
}