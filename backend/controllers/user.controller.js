import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from 'bcryptjs'
import { v2 as cloudinary} from 'cloudinary'

export const getUserProfile = async (req, res)=>{
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password")
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        res.status(200).json(user)
    } catch (err) {
        console.log("Error in getUserProfile: ", err)
        res.status(500).json({error: err.message})
    }
}

export const followUnfollowUser = async (req, res)=>{
    try {
        const {id} = req.params
        const userToModify = await  User.findById(id)
        const currentUser = await User.findById(req.user._id)


        if ( id === req.user._id.toString()){
            return res.status(400).json({error: "Self following/unfollowing not possible."})
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({error: "User not found"})
        }

        const isFollowing = currentUser.following.includes(id)

        
        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id }})
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id}})

            // TODO return the id of user as a resonse
            res.status(200).json({message: "User unfollowing successfull."})
        } else {
            // Follow User
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id}})

            // send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            })

            await newNotification.save()

            // to return the id of user as a response
            res.status(200).json({message: "User following successfull."})
        }
    } catch (err) {
        console.log("Error in followUnfollowUser: ", err)
        res.status(500).json({error: err.message})
    }
}


export const getSuggestedUsers = async (req, res)=>{
    try {
        const userId = req.user._id

        const userFollowedByMe = await User.findById(userId).select('following')

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne : userId}
                }
            },
            {$sample: {size: 10}}
        ])

        // filter out those users that are already followed
        const filteredUsers = users.filter( user=> !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0, 4)

        // retrival data password become null
        suggestedUsers.forEach(user=> user.password=null)

        res.status(200).json(suggestedUsers)
    } catch (err) {
        console.log("Error in getSuggestedUsers: ", err)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const updateUser = async (req, res)=> {
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body
    let { profileImg, coverImg } = req.body

    const userId = req.user._id

    try {
        
        let user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({error: "User not found"})
        }

        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            res.status(400).json({error: "Provide both current and new passwords"})
        }

        if (currentPassword && newPassword) {
            const isSame = await bcrypt.compare(currentPassword, user.password)

            if (!isSame) {
                return res.status(400).json({error: "Current password is wrong"})
            }

            if (newPassword.length < 6) {
                return res.status(400).json({error: "password length must be atleast 6 character long"})
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if (profileImg) {
            if (user.profileImg) {
                // https://.com/cl_name/image//imgid.png
                // passing parameter as imgid if profile Img already exists so first delete that then update
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }

            const uploadedImg = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedImg.secure_url
        }

        if (coverImg) {
            if (user.coverImg) {
                // https://.com/cl_name/image//imgid.png
                // passing parameter as imgid if profile Img already exists so first delete that then update
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }

            const uploadedImg = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedImg.secure_url
        }

        user.fullname = fullname || user.fullname
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()

        // password make it null in response
        user.password = null

        return res.status(200).json(user)

    } catch (err) {
        console.log("Error in updateUser: ", err)
        res.status(500).json({error: "Internal Server Error"})
    }
}