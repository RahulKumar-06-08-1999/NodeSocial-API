import express from 'express';
const router = express.Router();

import {
  createProfile,
  getProfileByUserId,
  getProfileLinkByUserId,
  updateProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  uploadProfilePhoto 
} from '../controllers/profileController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Route for creating a profile
router.route('/').post(protect, createProfile).get(protect, getProfileByUserId);

// Route for uploading profile photo (uses a different endpoint)
router.route('/uploads').post(protect, upload.single('photo'), uploadProfilePhoto);

// Route for getting followers of a profile
router.route('/followers').get(protect, getFollowers);

// Route for getting following of a profile
router.route('/following').get(protect, getFollowing);

// Route for following a user
router.route('/:userId/follow').post(protect, followUser);

// Route for unfollowing a user
router.route('/:userId/unfollow').post(protect, unfollowUser);

// Route for getting and updating profile by user ID
router.route('/').put(protect, updateProfile);

// Route for getting profile link by user ID
router.route('/:id').get(protect, getProfileLinkByUserId);

export default router;
