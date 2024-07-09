import mongoose from "mongoose";

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    followers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Adjust to 'User' if followers are users
        },
      },
    ],
    following: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Adjust to 'User' if following are users
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ username: 1 });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
