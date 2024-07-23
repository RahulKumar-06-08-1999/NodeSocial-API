import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
    },
  },
  {
    timestamps: true, // Add timestamps to track comment creation and update times
  }
);

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    media: {
      type: [String], // Array of strings to store URLs of media files
      default: [],
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        username: String,
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true, // Add timestamps to track post creation and update times
  }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
