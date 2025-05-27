const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const photoFilename = req.file.filename;

    try {
        //check if user exist
        const userExist = await User.findOne({ email });
        if(userExist) return res.status(400).json({
            message: 'User already exists'
        });

        //create new user
        const newUser = new User({ name, email, phone, password, photo: photoFilename, role });
        await newUser.save();

        //const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
};

//Login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        //check for user
        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({
            message: 'User not found'
        });

        //check for password match
        const isMatch = await user.matchPassword(password);
        if(!isMatch) return res.status(401).json({
            message: 'Invalid credentials'
        });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get profile
exports.getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    const updatedFields = { name, email };
    if (req.file) {
      updatedFields.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    ).select("-password");

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};
