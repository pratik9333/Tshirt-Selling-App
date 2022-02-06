const User = require("../models/user");
const cloudinary = require("cloudinary");
const getCookieToken = require("../utils/cookieToken");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const client = require("../config/redis");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!req.files) {
      return res.status(400).json({ error: "Photo is required to signup" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const findExistingEmail = await User.findOne({ email });

    if (findExistingEmail) {
      return res.status(400).json({
        error:
          "Email is already registered, please try again with another email",
      });
    }

    const file = req.files.photo;

    //uploading file to cloudinary
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    //creating user
    const user = await User.create({
      name,
      email,
      password,
      photo: {
        id: result.public_id,
        url: result.secure_url,
      },
    });

    //this will create token, store in cookie and will send response to frontend
    getCookieToken(user, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "email is incorrect" });
    }

    const validatePassword = await user.validatePassword(password);

    //validating email and password
    if (!validatePassword) {
      return res.status(401).json({ error: "password is incorrect" });
    }

    getCookieToken(user, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.logout = async (req, res) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  await client.del(`user:${req.user._id.toString()}`);

  res
    .status(200)
    .cookie("token", null, options)
    .json({
      success: true,
      message: "Logout Success",
    });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400).json({ error: "Please provide email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }

    const forgotToken = await user.generateForgotPasswordToken();

    await user.save({ validateBeforeSave: false });

    const URL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${forgotToken}`;

    const mailObj = {
      email,
      subject: "Password Reset Mail",
      text: `Copy paste this link in your URL and hit enter \n\n ${URL}`,
    };

    try {
      await sendMail(mailObj);
      res
        .status(200)
        .json({ success: true, message: `Email is been send to ${email}` });
    } catch (error) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      res
        .status(500)
        .json({ error: "Server has occured some problem, please try again" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyForgotPasswordToken = async (req, res) => {
  const forgotToken = req.params.token;

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Please provide password and confirm password" });
  }

  try {
    // hash the token as db also stores the hashed version
    const validateToken = crypto
      .createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    //find user based on hashing and also check for expiry

    const user = await User.findOne({
      forgotPasswordToken: validateToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ error: "Token is invalid or expired" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password does not match, please try again" });
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    getCookieToken(user, res);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getLoggedInUserDetails = (req, res) => {
  const user = req.user;

  //sending user details back if logged in
  res.status(200).json({ success: true, user });
};

exports.changePassword = async (req, res) => {
  // get user from middleware
  const userId = req.user.id;

  try {
    const { oldPassword, password, confirmPassword } = req.body;
    // get user from database
    const user = await User.findById(userId);

    if (confirmPassword !== password) {
      res
        .status(400)
        .json({ error: "Password does not match, please try again" });
    }

    //check if old password is correct
    const isCorrectOldPassword = await user.validatePassword(oldPassword);

    if (!isCorrectOldPassword) {
      return res
        .status(401)
        .json({ error: "Old password is incorrect, please try again" });
    }

    // allow to set new password
    user.password = password;

    // save user and send fresh token
    await user.save();

    getCookieToken(user, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server occured some problem, please try again" });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let updateUser = {
      name: req.body.name ? req.body.name : user.name,
      email: req.body.email ? req.body.email : user.email,
    };

    if (req.files) {
      const imageId = user.photo.id;

      //delete photo on cloudinary
      const resp = await cloudinary.v2.uploader.destroy(imageId);

      //uploading file to cloudinary
      const result = await cloudinary.v2.uploader.upload(
        req.files.photo.tempFilePath,
        {
          folder: "users",
          width: 150,
          crop: "scale",
        }
      );
      updateUser = {
        ...updateUser,
        photo: {
          id: result.public_id,
          url: result.secure_url,
        },
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateUser, {
      new: true,
    });

    updatedUser.password = undefined;
    updatedUser.createdAt = undefined;
    updatedUser.__v = undefined;

    res
      .status(200)
      .json({ success: true, message: "User profile is updated", updatedUser });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["manager", "user"] },
    });

    for (let user of users) {
      user.password = undefined;
      user.__v = undefined;
      user.createdAt = undefined;
    }

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getOneUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    user.password = undefined;
    user.__v = undefined;
    user.createdAt = undefined;

    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminUpdateOneUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    let updateUser = {
      name: req.body.name ? req.body.name : user.name,
      email: req.body.email ? req.body.email : user.email,
      role: req.body.role ? req.body.role : user.role,
    };

    if (req.files) {
      const imageId = user.photo.id;

      //delete photo on cloudinary
      await cloudinary.v2.uploader.destroy(imageId);

      //uploading file to cloudinary
      const result = await cloudinary.v2.uploader.upload(
        req.files.photo.tempFilePath,
        {
          folder: "users",
          width: 150,
          crop: "scale",
        }
      );
      updateUser = {
        ...updateUser,
        photo: {
          id: result.public_id,
          url: result.secure_url,
        },
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateUser,
      {
        new: true,
      }
    );

    updatedUser.password = undefined;
    updatedUser.createdAt = undefined;
    updatedUser.__v = undefined;

    res
      .status(200)
      .json({ success: true, message: "User profile is updated", updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminDeleteOneUser = async (req, res) => {
  try {
    // get user from url
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }

    // get image id from user in database
    const imageId = user.photo.id;

    // delete image from cloudinary
    await cloudinary.v2.uploader.destroy(imageId);

    // remove user from databse
    await user.remove();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getUsersForManager = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    });

    // making required fields undefined and sending in frontend
    for (let user of users) {
      user.password = undefined;
      user.__v = undefined;
      user.createdAt = undefined;
    }

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};
