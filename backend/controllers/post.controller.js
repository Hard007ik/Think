import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import { v2 as cloudinary } from 'cloudinary'

export const createPost= async (req, res)=>{
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id.toString()

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        if (!text && !img) {
            return res.status(400).json({message: "Post must have text or image"})
        }

        if (img) {
            const uploadedImg = await cloudinary.uploader.upload(img)
            img = uploadedImg.secure_url
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        })

        await newPost.save()
        res.status(201).json({newPost})
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in createPost controller", err)
    }
}

export const deletePost = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({error: 'Post not found'})
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({error: "You are unauthorized to delete this Post"})
        }

        if(post.img){
            const imgid = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgid)
        }
        

        await Post.findByIdAndDelete(req.params.id) // changed here

        res.status(200).json({message: "Post deleted successfully"})
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in deletePost controller", err)
    }
}

export const commentPost = async (req, res) =>{
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id.toString()
        if (!text) {
            return res.status(400).json({error: "Comment only in text."})
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({error: 'Post not found'})
        }

        const comment = { user: userId, text}

        post.comments.push(comment)
        await post.save()

        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in commentPost controller", err)
    }
}

export const likeUnlikePost = async (req, res)=>{
    try {
        const userId = req.user._id
        const { id : postId } = req.params

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({error: "Post not found"})
        }

        const userLikePost = post.likes.includes(userId)

        if (userLikePost){
            // make it unlike
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}})
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})

            const updatedLikes = post.likes.filter((id)=>{
                return id.toString() !== userId.toString()
            })
            res.status(200).json(updatedLikes)
        }
        else {
            // make it like
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            await post.save()

            const notification = new Notification({
                from:userId,
                to:post.user,
                type:'like',
            })
            await notification.save()

            // like(userId) added array return 
            res.status(200).json(post.likes)

        }
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in likeUnlikePost controller", err)
    }
}

export const getAllPosts = async (req, res)=> {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: 'user', select: '-password',
        }).populate({
            path: 'comments.user',
            select: '-password',
        })

        if (posts.length === 0) {
            return res.status(200).json([])
        }

        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in getAllPosts controller", err)
    }
}

export const getLikedPosts = async (req, res) =>{
    try {
        const userId = req.params.id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({error: "User not found"})
        }

        const likedPosts = await Post.find({_id: {$in : user.likedPosts}})
        .populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password',
        })

        res.status(200).json(likedPosts)
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in getLikedPosts controller", err)
    }
}

export const getFollowingPosts = async (req, res)=>{
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({error: "User not found"})
        }

        const following = user.following

        const feedPosts = await Post.find({ user: { $in : following}})
        .sort({createdAt: -1})
        .populate({
            path: "user", select: '-password'
        })
        .populate({
            path: 'comments.user', select: '-password'
        })

        res.status(200).json(feedPosts)
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in getFollowingPosts controller", err)
    }
}

export const getUserPosts = async (req, res)=>{
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const posts = await Post.find({ user: user._id}).sort({ createdAt: -1})
        .populate(
            {path: 'user', select: '-password'}
        ).populate(
            {path: 'comments.user', select: '-password'}
        )

        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({error: "Internal Server Error"})
        console.error("Error in getUserPosts controller", err)
    }
}