import express from 'express'
import { protectRoute } from '../middleware/protectRoute.middleware.js'
import { commentPost, createPost, deletePost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } 
from '../controllers/post.controller.js'

const router = express.Router()

router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/comment/:id", protectRoute, commentPost)
router.delete("/:id", protectRoute, deletePost)
router.get('/all', protectRoute, getAllPosts)
router.get('/likes/:id', protectRoute, getLikedPosts)
router.get('/following', protectRoute, getFollowingPosts)
router.get('/user/:username', protectRoute, getUserPosts)

export default router