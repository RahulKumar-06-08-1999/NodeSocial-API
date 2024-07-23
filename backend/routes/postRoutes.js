import express from 'express';
import {
  createPostWithContent,
  uploadPostMedia,
  getPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
  likePost,
  unlikePost,
  getLikedPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


const router = express.Router();

// Route for uploading post media 
router.route('/').post(protect, createPostWithContent).get(getPosts);
router.route('/user').get(protect, getPostsByUserId);
router.route('/liked').get(protect, getLikedPosts);
router.route('/uploads').post(protect, upload.single('media'), uploadPostMedia);
router.route('/:id').put(protect, updatePost).delete(protect, deletePost);
router.route('/:id/comments').post(protect, addComment);
router.route('/:postId/comments/:commentId').put(protect, updateComment).delete(protect, deleteComment);
router.route('/:id/like').post(protect, likePost);
router.route('/:id/unlike').post(protect, unlikePost);

export default router;
