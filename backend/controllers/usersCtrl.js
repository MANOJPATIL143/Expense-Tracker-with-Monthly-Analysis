const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const dotenv = require("dotenv");
dotenv.config();

//!User Registration

const usersController = {
  //!Register
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    //!Validate
    if (!username || !email || !password) {
      throw new Error("Please all fields are required");
    }
    //!Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }
    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //! Create the user and save into db
    const userCreated = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    //! Send the response

    res.json({
      username: userCreated.username,
      email: userCreated.email,
      id: userCreated._id,
    });
  }),
  //!Login
  login: asyncHandler(async (req, res) => {
    // console.log("jwt expire", process.env.JWT_EXPIRE);

    //! Get the user data
    const { email, password } = req.body;
    //!check if email is valid
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid login credentials");
    }
    //! Compare the user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid login credentials");
    }
    //! Generate a token
    const token = jwt.sign({ id: user._id }, "masynctechKey", {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    });
    //!Send the response
    res.json({
      message: "Login Success",
      token,
      id: user._id,
      email: user.email,
      username: user.username,
    });
  }),

  //!Logout
  logout: asyncHandler(async (req, res) => {
    res.json({ message: "Logout Success" });
  }),

  //!profile
  profile: asyncHandler(async (req, res) => {
    //! Find the user
    console.log(req.user);
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //!Send the response
    res.json({ username: user.username, email: user.email });
  }),
  //! Change password
  changeUserPassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    //! Find the user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //! Hash the new password before saving
    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    //! ReSave
    await user.save({
      validateBeforeSave: false,
    });
    //!Send the response
    res.json({ message: "Password Changed successfully" });
  }),
  //! update user profile
  updateUserProfile: asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      {
        username,
        email,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User profile updated successfully", updatedUser });
  }),

  // user detail by authrisation
  getUserDetails: asyncHandler(async (req, res) => {
    try {
      //! Get the token from the header
      const tokcen = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Extract the token
      const token = tokcen.split(" ")[1];

      // Fetch user from database
      const user = await User.findById(decoded.id).select("-password"); // Exclude password

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Send user details
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      res.status(401);
      throw new Error("Invalid or expired token");
    }
  }),
};


module.exports = usersController;
