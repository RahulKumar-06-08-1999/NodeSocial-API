import Post from '../models/postModels.js';
import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModels.js';

// @desc    Create a new post with content
// @route   POST /api/posts/
// @access  Private
// const createPostWithContent = asyncHandler(async (req, res) => {
//   try {
//     const { content } = req.body;

//     // Create a new post with the provided content and user ID
//     const post = new Post({
//       user: req.user._id,
//       content,
//     });

//     // Save the post to the database
//     const createdPost = await post.save();
//     res.status(201).json(createdPost);
//   } catch (error) {
//     // Handle any errors that occur
//     res.status(500).json({ message: error.message });
//   }
// });

const createPostWithContent = asyncHandler(async (req, res) => {
  try {
    const { content, media } = req.body;

    // Create a new post with the provided content, user ID, and media
    const post = new Post({
      user: req.user._id,
      content,
      media: media || [],
    });

    // Save the post to the database
    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ message: error.message });
  }
});


// @desc    Upload media for a post
// @route   POST /api/posts/media
// @access  Private
// const uploadPostMedia = asyncHandler(async (req, res) => {
//   const media = req.file ? `${req.file.filename}` : null;

//   if (!media) {
//     res.status(400);
//     throw new Error("No media selected");
//   }

//   try {
//     let post = await Post.findOne({ user: req.user._id });

//     if (!post) {
//       res.status(404);
//       throw new Error('Post not found');
//     }

//     // Update the media field with the new path, overwriting any existing media
//     post.media = media;

//     const savedPost = await post.save();
//     res.json(savedPost);
//   } catch (error) {
//     console.error('Error uploading media:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

const uploadPostMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No media selected" });
    return;
  }

  try {
    const mediaPath = req.file.path; // Assuming multer is saving the file and path is available in req.file.path
    console.log('Media uploaded successfully:', mediaPath);

    res.status(200).json({ media: mediaPath });
  } catch (error) {
    console.error('Error uploading media:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name')
      .populate({
        path: 'comments.user',
        select: 'name'
      })
      .populate({
        path: 'likes.user',
        select: 'username'
      }).exec();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Get posts by user ID
// @route   GET /api/posts/
// @access  Public
const getPostsByUserId = asyncHandler(async (req, res) => {
  try {
    // console.log("User ID:", req.user._id);
    
    // Find posts by user ID
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .populate({
        path: 'likes.user',
        select: 'username'
      });

    // Debugging output to ensure posts are retrieved
    // console.log("Posts:", posts);

    if (posts && posts.length > 0) {
      res.json(posts);
    } else {
      res.status(404);
      throw new Error('Posts not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  

// @desc    Get posts liked by the authenticated user
// @route   GET /api/posts/liked
// @access  Private
const getLikedPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Find posts where the user has liked
    const likedPosts = await Post.find({ 'likes.user': userId }).select('_id');

    if (likedPosts.length > 0) {
      res.json({ likedPostIds: likedPosts.map(post => post._id) });
    } else {
      res.status(404);
      throw new Error('No liked posts found for this user');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  try {
    const { content, media } = req.body;

    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this post');
      }

      post.content = content || post.content;
      post.media = media || post.media;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this post');
      }

      await post.deleteOne();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id).populate('comments.user', 'name');

    if (post) {
      const comment = {
        user: req.user._id,
        text,
      };

      post.comments.push(comment);
      await post.save();
      res.status(201).json({ post });
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (post) {
      const comment = post.comments.id(req.params.commentId);

      if (comment) {
        // Check if the comment belongs to the authenticated user
        if (comment.user.toString() === req.user._id.toString()) {
          post.comments.pull(comment._id);
          await post.save();
          res.status(200).json({ message: 'Comment removed' });
        } else {
          res.status(401);
          throw new Error('User not authorized to delete this comment');
        }
      } else {
        res.status(404);
        throw new Error('Comment not found');
      }
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Update a comment
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.postId);

    if (post) {
      const comment = post.comments.id(req.params.commentId);

      if (comment) {
        // Check if the comment belongs to the authenticated user
        if (comment.user.toString() === req.user._id.toString()) {
          comment.text = text;
          await post.save();
          res.status(200).json({ message: 'Comment updated', comment });
        } else {
          res.status(401);
          throw new Error('User not authorized to update this comment');
        }
      } else {
        res.status(404);
        throw new Error('Comment not found');
      }
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      // Check if post is already liked
      const alreadyLiked = post.likes.some(
        (like) => like.user.toString() === req.user._id.toString()
      );

      if (alreadyLiked) {
        res.status(400).json({ message: 'Post already liked' });
        return;
      }

      // Fetch profile to get username
      const profile = await Profile.findOne({ user: req.user._id });

      if (!profile) {
        res.status(404).json({ message: 'Profile not found' });
        return;
      }

      post.likes.push({ user: req.user._id, username: profile.username });
      await post.save();
      res.json({ message: 'Post liked', likes: post.likes });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      // Remove the user's like from the post
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString()
      );
      await post.save();
      res.json({ message: 'Post unliked', likes: post.likes });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export {
  createPostWithContent,
  uploadPostMedia,
  getLikedPosts,
  getPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
  likePost,
  unlikePost,
};
