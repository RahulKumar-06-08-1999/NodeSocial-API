import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModels.js';


// @desc    Create profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the profile already exists
    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      res.status(400);
      throw new Error('Profile already exists');
    }

    // Create new profile
    profile = new Profile({
      user: req.user._id,
      username,
    });

    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Upload profile photo
// @route   POST /api/profiles/uploads
// @access  Private
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const photo = req.file ? req.file.path : null; // Get the file path from multer

  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    // Update the photo field with the new path, overwriting any existing photo
    profile.photo = photo;

    const savedProfile = await profile.save();
    res.json(savedProfile);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// @desc    Get profile by user ID
// @route   GET /api/profiles/:userId
// @access  Private
const getProfileByUserId = asyncHandler(async (req, res) => {
  try {
    console.log('Request params:', req.params);
    console.log('Fetching profile for userId:', req.params.userId);

    const profile = await Profile.findOne({ user: req.params.userId }).populate({ path: 'user', select: 'name email' });

    if (profile) {
      res.json(profile);
    } else {
      console.log('Profile not found for userId:', req.params.userId);
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Update profile
// @route   PUT /api/profiles/:userId
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId });

  if (profile) {
    profile.username = req.body.username || profile.username;
    profile.photo = req.body.photo || profile.photo;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});


// @desc    Get followers
// @route   GET /api/profiles/:userId/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId })
    .populate('followers.user', 'username');

  if (profile) {
    res.json(profile.followers);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});


// @desc    Get following
// @route   GET /api/profiles/:userId/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId })
    .populate('following.user', 'username');

  if (profile) {
    res.json(profile.following);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});


// @desc    Follow a user
// @route   POST /api/profiles/:userId/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;
  
    // Ensure the user is not trying to follow themselves
    if (userId === currentUserId.toString()) {
      res.status(400);
      throw new Error('You cannot follow yourself');
    }
  
    const userToFollow = await Profile.findOne({ user: userId });
    const currentUserProfile = await Profile.findOne({ user: currentUserId });
  
    if (!userToFollow || !currentUserProfile) {
      res.status(404);
      throw new Error('Profile not found');
    }
  
    // Check if the user is already following the userToFollow
    const isFollowing = currentUserProfile.following.some(
      (follow) => follow.user.toString() === userToFollow.user.toString()
    );
  
    if (isFollowing) {
      res.status(400);
      throw new Error('You are already following this user');
    }
  
    // Add userToFollow to currentUserProfile's following list
    currentUserProfile.following.push({ user: userId });
    await currentUserProfile.save();
  
    // Add currentUserProfile to userToFollow's followers list
    userToFollow.followers.push({ user: currentUserId });
    await userToFollow.save();
  
    res.status(200).json({ message: 'User followed successfully' });
  });
  
  
// @desc    Unfollow a user
// @route   POST /api/profiles/:userId/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;
  
    // Ensure the user is not trying to unfollow themselves
    if (userId === currentUserId.toString()) {
      res.status(400);
      throw new Error('You cannot unfollow yourself');
    }
  
    const userToUnfollow = await Profile.findOne({ user: userId });
    const currentUserProfile = await Profile.findOne({ user: currentUserId });
  
    if (!userToUnfollow || !currentUserProfile) {
      res.status(404);
      throw new Error('Profile not found');
    }
  
    // Check if the user is already not following the userToUnfollow
    const isFollowing = currentUserProfile.following.some(
      (follow) => follow.user.toString() === userToUnfollow.user.toString()
    );
  
    if (!isFollowing) {
      res.status(400);
      throw new Error('You are not following this user');
    }
  
    // Remove userToUnfollow from currentUserProfile's following list
    currentUserProfile.following = currentUserProfile.following.filter(
      (follow) => follow.user.toString() !== userId
    );
    await currentUserProfile.save();
  
    // Remove currentUserProfile from userToUnfollow's followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.user.toString() !== currentUserId.toString()
    );
    await userToUnfollow.save();
  
    res.status(200).json({ message: 'User unfollowed successfully' });
  });


export { createProfile, getProfileByUserId, updateProfile, getFollowers, getFollowing, followUser, unfollowUser};
