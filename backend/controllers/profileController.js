import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModels.js';
import  User from "../models/userModels.js";

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
  const photo = req.file ? `${req.file.filename}` : null; // Save only the relative path

  if (!photo) {
    res.status(400);
    throw new Error('No photo selected');
  }

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




/// @desc    Get profile by user._id
// @route   GET /api/profiles/
// @access  Private
const getProfileByUserId = asyncHandler(async (req, res) => {
  try {
    console.log('Request User:', req.user);
    console.log('Fetching profile for userId:', req.user._id);

    const profile = await Profile.findOne({ user: req.user._id }).populate({ path: 'user', select: 'name email' });

    if (profile) {
      const profileData = {
        _id: profile._id,
        user: profile.user,
        username: profile.username,
        // Add other profile fields as needed
        profileLink: `/profiles/${req.user._id}`, // Example link to user profile
      };
      res.json(profileData);
    } else {
      console.log('Profile not found for userId:', req.user._id);
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @desc    Get profile by link 
// @route   GET /api/profiles/:userId
// @access  Private
const getProfileLinkByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await Profile.findOne({ user: userId });
    console.log("profile", profile);

    if (profile) {
      res.json({ profile }); 
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching profile link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @desc    Update profile
// @route   PUT /api/profiles/:userId
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    profile.username = req.body.username || profile.username;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});


// @desc    Get followers
// @route   GET /api/profiles/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id })
    .populate('followers.user', 'name');

  if (profile) {
    const followersWithUsername = await Promise.all(
      profile.followers.map(async (follower) => {
        const followerProfile = await Profile.findOne({ user: follower.user._id });
        return {
          user: {
            _id: follower.user._id,
            name: follower.user.name,
            username: followerProfile.username,
          },
          _id: follower._id,
        };
      })
    );

    res.json(followersWithUsername);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});



// @desc    Get following
// @route   GET /api/profiles/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id })
    .populate('following.user', 'name');

  if (profile) {
    const followingWithUsername = await Promise.all(
      profile.following.map(async (following) => {
        const followingProfile = await Profile.findOne({ user: following.user._id });
        return {
          user: {
            _id: following.user._id,
            name: following.user.name,
            username: followingProfile.username,
          },
          _id: following._id,
        };
      })
    );

    res.json(followingWithUsername);
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

  // Find user to follow
  const userToFollow = await User.findById(userId).exec();
  if (!userToFollow) {
    res.status(404);
    throw new Error('User to follow not found');
  }

  // Find current user profile
  const currentUserProfile = await Profile.findOne({ user: currentUserId });
  if (!currentUserProfile) {
    res.status(404);
    throw new Error('Current user profile not found');
  }

 // Find user to follow profile or create if not exists
 let userToFollowProfile = await Profile.findOne({ user: userId });
 if (!userToFollowProfile) {
   // Create user to follow profile with a default username
   userToFollowProfile = await Profile.create({ user: userId, username: 'DefaultUsername' });
   if (!userToFollowProfile) {
     res.status(500);
     throw new Error('Failed to create user to follow profile');
   }
 }

  // Check if the user is already following the userToFollow
  const isFollowing = currentUserProfile.following.some(
    (follow) => follow.user.toString() === userToFollowProfile.user.toString()
  );

  if (isFollowing) {
    res.status(400);
    throw new Error('You are already following this user');
  }

  // Add userToFollow to currentUserProfile's following list
  currentUserProfile.following.push({ user: userId });
  await currentUserProfile.save();

  // Add currentUserProfile to userToFollow's followers list
  userToFollowProfile.followers.push({ user: currentUserId });
  await userToFollowProfile.save();

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

  // Find user to unfollow
  const userToUnfollow = await User.findById(userId).exec();
  if (!userToUnfollow) {
    res.status(404);
    throw new Error('User to unfollow not found');
  }

  // Find current user profile
  const currentUserProfile = await Profile.findOne({ user: currentUserId });
  if (!currentUserProfile) {
    res.status(404);
    throw new Error('Current user profile not found');
  }

  // Find user to unfollow profile
  const userToUnfollowProfile = await Profile.findOne({ user: userId });
  if (!userToUnfollowProfile) {
    res.status(404);
    throw new Error('User to unfollow profile not found');
  }

  // Check if the user is currently following the userToUnfollow
  const isFollowing = currentUserProfile.following.some(
    (follow) => follow.user.toString() === userToUnfollowProfile.user.toString()
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
  userToUnfollowProfile.followers = userToUnfollowProfile.followers.filter(
    (follower) => follower.user.toString() !== currentUserId
  );
  await userToUnfollowProfile.save();

  res.status(200).json({ message: 'User unfollowed successfully' });
});


export { createProfile, getProfileByUserId, updateProfile, getFollowers, getFollowing, getProfileLinkByUserId, followUser, unfollowUser};
