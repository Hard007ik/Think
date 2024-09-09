
import jwt from 'jsonwebtoken'

export default function generateTokenAndSetCookie(userid, res){
    const token = jwt.sign(
        {userid},
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    )

    res.cookie('jwt', token, {
        maxAge: 1*24*60*60*1000, // milisecond
        httpOnly: true, // prevent xss attacks cross-site scripting attacks
        sameSite: 'strict', // prevent csrf attacks
        secure: process.env.NODE_ENV !== 'development',
        
    })
}