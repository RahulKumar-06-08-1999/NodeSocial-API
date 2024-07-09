import express from 'express';
const router = express.Router();

import {
  createProfile,
  getProfileByUserId,
  updateProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  uploadProfilePhoto // Import the new controller function
} from '../controllers/profileController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Route for creating a profile
router.route('/').post(protect, createProfile);

// Route for uploading profile photo (uses a different endpoint)
router.route('/uploads').post(protect, upload.single('photo'), uploadProfilePhoto);

// Route for getting a profile by user ID and updating profile
router.route('/:userId').get(protect, getProfileByUserId).put(protect, updateProfile);

// Route for getting followers of a profile
router.route('/:userId/followers').get(protect, getFollowers);

// Route for getting following of a profile
router.route('/:userId/following').get(protect, getFollowing);

// Route for following a user
router.route('/:userId/follow').post(protect, followUser);

// Route for unfollowing a user
router.route('/:userId/unfollow').post(protect, unfollowUser);

export default router;
