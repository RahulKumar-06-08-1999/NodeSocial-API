import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/userModels.js';  

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Log user details to debug
      console.log('Authenticated User:', req.user);

      // Validate that req.user._id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
        res.status(400);
        throw new Error('Invalid user ID');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };
