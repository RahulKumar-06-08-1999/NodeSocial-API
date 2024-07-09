import express from 'express';
import {
  createPostWithContent,
  uploadPostMedia,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  likePost,
  unlikePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


const router = express.Router();

router.route('/').post(protect, createPostWithContent).get(getPosts);
// Route for uploading post media 
router.route('/uploads').post(protect, upload.single('media'), uploadPostMedia);
router.route('/:id').get(getPostById).put(protect, updatePost).delete(protect, deletePost);
router.route('/:id/comments').post(protect, addComment);
router.route('/:id/like').post(protect, likePost);
router.route('/:id/unlike').post(protect, unlikePost);

export default router;
