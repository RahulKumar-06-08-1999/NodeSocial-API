import asyncHandler from "express-async-handler";
import Profile from "../models/profileModels.js";
import User from "../models/userModels.js";
import mongoose from "mongoose";

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the profile already exists
    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    // Create new profile
    profile = new Profile({
      user: req.user._id,
      username,
    });

    const savedProfile = await profile.save();

    // Update profileLink after saving the profile
    savedProfile.profileLink = `/profiles/${savedProfile.user}`;
    await savedProfile.save();

    res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Upload profile photo
// @route   POST /api/profiles/uploads
// @access  Private
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const photo = req.file ? `${req.file.filename}` : null; // Save only the relative path

  if (!photo) {
    res.status(400);
    throw new Error("No photo selected");
  }

  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      res.status(404);
      throw new Error("Profile not found");
    }

    // Update the photo field with the new path, overwriting any existing photo
    profile.photo = photo;

    const savedProfile = await profile.save();
    res.json(savedProfile);
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Get profile by user._id
// @route   GET /api/profiles/
// @access  Private
const getProfileByUserId = asyncHandler(async (req, res) => {
  try {
    console.log("Request User:", req.user);
    console.log("Fetching profile for userId:", req.user._id);

    const profile = await Profile.findOne({ user: req.user._id }).populate({
      path: "user",
      select: "name email",
    });

    if (profile) {
      const profileData = {
        _id: profile._id,
        user: profile.user,
        username: profile.username,
        photo: profile.photo,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        __v: profile.__v,
        profileLink: profile.profileLink,
      };
      res.json(profileData);
    } else {
      console.log("Profile not found for userId:", req.user._id);
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// @desc    Get profile by link
// @route   GET /api/profiles/:userId
// @access  Private
// const getProfileLinkByUserId = asyncHandler(async (req, res) => {

//   const { id } = req.params;
//   console.log("User", id);

//   try {
//     const profile = await Profile.findOne({ user: id });
//     console.log("profile", profile);

//     if (profile) {
//       res.json({ profile });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching profile link:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



// @desc    Update profile
// @route   PUT /api/profiles/:userId
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      profile.username = req.body.username || profile.username;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404);
      throw new Error("Profile not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Get followers for the logged-in user
// @route   GET /api/profiles/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    // Log start of the function
    console.log("Starting getFollowers function");

    // Assuming req.user._id is the logged-in user's ObjectId
    const userId = req.user._id;
    console.log("User ID:", userId);

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userProfile = await Profile.findOne({ user: userId });
    console.log("User profile found:", userProfile);

    if (!userProfile) {
      console.log("Profile not found");
      return res.status(404).json({ message: "Profile not found" });
    }

    // Extract follower user IDs from the userProfile
    const followerIds = userProfile.followers.map((follower) => {
      if (!mongoose.Types.ObjectId.isValid(follower.user)) {
        console.log(`Invalid follower ID: ${follower.user}`);
        throw new Error(`Invalid follower ID: ${follower.user}`);
      }
      return follower.user;
    });
    console.log("Follower IDs:", followerIds);

    // Query profiles of followers using the extracted IDs
    const followersProfiles = await Profile.find({ user: { $in: followerIds } })
      .select("username profileLink photo")
      .exec();
    console.log("Followers profiles found:", followersProfiles);

    res.status(200).json(followersProfiles);
  } catch (error) {
    console.error("Error followers:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc    Get following for the logged-in user
// @route   GET /api/profiles/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  try {
    // Log start of the function
    console.log("Starting getFollowing function");

    // Assuming req.user._id is the logged-in user's ObjectId
    const userId = req.user._id;
    console.log("User ID:", userId);

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userProfile = await Profile.findOne({ user: userId });
    console.log("User profile found:", userProfile);

    if (!userProfile) {
      console.log("Profile not found");
      return res.status(404).json({ message: "Profile not found" });
    }

    // Extract following user IDs from the userProfile
    const followingIds = userProfile.following.map((following) => {
      if (!mongoose.Types.ObjectId.isValid(following.user)) {
        console.log(`Invalid following ID: ${following.user}`);
        throw new Error(`Invalid following ID: ${following.user}`);
      }
      return following.user;
    });
    console.log("Following IDs:", followingIds);

    // Query profiles of following users using the extracted IDs
    const followingProfiles = await Profile.find({
      user: { $in: followingIds },
    })
      .select("username profileLink photo")
      .exec();
    console.log("Following profiles found:", followingProfiles);

    res.status(200).json(followingProfiles);
  } catch (error) {
    console.error("Error following:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Follow a user
// @route   POST /api/profiles/:userId/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Ensure the user is not trying to follow themselves
    if (userId === currentUserId.toString()) {
      res.status(400);
      throw new Error("You cannot follow yourself");
    }

    // Find user to follow
    const userToFollow = await User.findById(userId).exec();
    if (!userToFollow) {
      res.status(404);
      throw new Error("User to follow not found");
    }

    // Find current user profile
    const currentUserProfile = await Profile.findOne({ user: currentUserId });
    if (!currentUserProfile) {
      res.status(404);
      throw new Error("Current user profile not found");
    }

    // Find user to follow profile or create if not exists
    let userToFollowProfile = await Profile.findOne({ user: userId });
    if (!userToFollowProfile) {
      res.status(500);
      throw new Error("User has to create a profile");
    }

    // Check if the user is already following the userToFollow
    const isFollowing = currentUserProfile.following.some(
      (follow) => follow.user.toString() === userToFollowProfile.user.toString()
    );

    if (isFollowing) {
      res.status(400);
      throw new Error("You are already following this user");
    }

    // Add userToFollow to currentUserProfile's following list
    currentUserProfile.following.push({ user: userId });
    await currentUserProfile.save();

    // Add currentUser to userToFollowProfile's followers list
    userToFollowProfile.followers.push({ user: currentUserId });
    await userToFollowProfile.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Unfollow a user
// @route   POST /api/profiles/:userId/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Ensure the user is not trying to unfollow themselves
    if (userId === currentUserId.toString()) {
      res.status(400);
      throw new Error("You cannot unfollow yourself");
    }

    // Find user to unfollow
    const userToUnfollow = await User.findById(userId).exec();
    if (!userToUnfollow) {
      res.status(404);
      throw new Error("User to unfollow not found");
    }

    // Find current user profile
    const currentUserProfile = await Profile.findOne({ user: currentUserId });
    if (!currentUserProfile) {
      res.status(404);
      throw new Error("Current user profile not found");
    }

    // Find user to unfollow profile
    const userToUnfollowProfile = await Profile.findOne({ user: userId });
    if (!userToUnfollowProfile) {
      res.status(404);
      throw new Error("User to unfollow profile not found");
    }

    // Check if the user is currently following the userToUnfollow
    const isFollowing = currentUserProfile.following.some(
      (follow) => follow.user.toString() === userToUnfollowProfile.user.toString()
    );

    if (!isFollowing) {
      res.status(400);
      throw new Error("You are not following this user");
    }

    // Remove userToUnfollow from currentUserProfile's following list
    currentUserProfile.following = currentUserProfile.following.filter(
      (follow) => follow.user.toString() !== userToUnfollowProfile.user.toString()
    );
    await currentUserProfile.save();

    // Remove currentUser from userToUnfollowProfile's followers list
    userToUnfollowProfile.followers = userToUnfollowProfile.followers.filter(
      (follower) => follower.user.toString() !== currentUserId.toString()
    );
    await userToUnfollowProfile.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export {
  createProfile,
  getProfileByUserId,
  updateProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
};
