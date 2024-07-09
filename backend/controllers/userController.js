import asyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import generateToken from "../utils/generateToken.js";


// @desc   Login(Auth) user & Get token
// @route  POST api/users/auth
// @Access public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ "Error": `User not Registered` });
      }

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id); // Call generateToken, which sets the cookie

        // Respond with user data and token
        res.status(200).json({
            // _id: user._id,
            // name: user.name,
            // email: user.email,
            Accesstoken: token 
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
}); 


// @desc  Register a new user
// @route  POST api/users
// @Access public
const registerUser = asyncHandler( async (req, res, next) => {
    const { name, email, password } = req.body

    try {
        if (!name) {
          return next(res.status(400).json({ "Error": "Please provide a valid name" }));
        }

        if (!password) {
            return next(res.status(400).json({ "Error": "Please provide a password" }));
          }

        // Check if email is provided and has a valid format
        if (!email || !email.includes('@')) {
            return next(res.status(400).json({ "Error": "Please provide a valid email address" }));
        }

        const userExist = await User.findOne({ email })

        if(userExist){
            res.status(400);
            throw new Error("User(Email) Already Exists");
        }

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        res.status(201).json({ Success: "User registered successfully",
            name: user.name,
            email: user.email
         });
    } else {
        res.status(400);
        throw new Error("Invalid User Data");   
    }
    }catch (err) {
        console.error(err);
        return res.status(500).json({ "Error": err.message });
      }
});


// @desc    Logout user / clear cookie
// @route   GET /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevents CSRF attacks
        expires: new Date(0), // Expire the cookie immediately
    });
    res.status(200).json({ message: 'Logged out successfully' });
};



// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUser = asyncHandler(async (req, res, next) => {
  console.log('req.user:', req.user); // Log the req.user

  if (!req.user) {
    const error = new Error('User not found in request');
    res.status(404);
    next(error);
    return;
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    const error = new Error('User not found');
    res.status(404);
    next(error);
  }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
  
      if (req.body.password) {
        user.password = req.body.password;
      }
  
      const updatedUser = await user.save();
  
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });


// @desc  Delete User Profile
// @route  DELETE api/users/profile
// @Access private
const deleteUser = asyncHandler( async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "delete User profile"});
});


export { authUser, getUser, registerUser, logoutUser, updateUser, deleteUser };