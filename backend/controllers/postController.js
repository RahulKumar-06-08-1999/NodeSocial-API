import Post from '../models/postModels.js';
import asyncHandler from 'express-async-handler';
import upload from '../middleware/uploadMiddleware.js';


// // @desc    Create a new post
// // @route   POST /api/posts
// // @access  Private
// const createPost = asyncHandler(async (req, res) => {
//   const { content, media } = req.body;
//   const post = new Post({
//     user: req.user._id,
//     content,
//     media,
//   });

//   const createdPost = await post.save();
//   res.status(201).json(createdPost);
// });

// @desc    Create a new post with content
// @route   POST /api/posts/
// @access  Private
const createPostWithContent = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const post = new Post({
    user: req.user._id,
    content,
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});


// @desc    Upload media for a post
// @route   POST /api/posts/media
// @access  Private
const uploadPostMedia = asyncHandler(async (req, res) => {
  // const { postId } = req.params;
  const media = req.file ? req.file.path : null;

  try {
    let post = await Post.findOne({ user: req.user._id });

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Update the media field with the new path, overwriting any existing media
    post.media = media;

    const savedPost = await post.save();
    res.json(savedPost);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate('user', 'name').populate('comments.user', 'name');
  res.json(posts);
});



// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', 'name').populate('comments.user', 'name');

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});



// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
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
});



// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this post');
    }

    await post.deleteOne    ();
    res.json({ message: 'Post removed' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});



// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const post = await Post.findById(req.params.id);

  if (post) {
    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ message: 'Comment added' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});



// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.likes.some((like) => like.user.toString() === req.user._id.toString())) {
      res.status(400);
      throw new Error('Post already liked');
    }

    post.likes.push({ user: req.user._id });
    await post.save();
    res.json({ message: 'Post liked' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});



// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    post.likes = post.likes.filter((like) => like.user.toString() !== req.user._id.toString());
    await post.save();
    res.json({ message: 'Post unliked' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

export {
  createPostWithContent,
  uploadPostMedia,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  likePost,
  unlikePost,
};
