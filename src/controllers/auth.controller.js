const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const emailService = require("../services/email.service.js");
const tokenBlackListModel = require("../models/blacklist.model.js")

/*
  User Register Controller

  POST /api/auth/register
*/

   async function userRegister(req, res) {
  try {





    const { email, name, password } = req.body;

    // Check whether email already exists
    const isExists = await userModel.findOne({ email });

    if (isExists) {
      return res.status(400).json({
        message: "Email already exists",
        status: "failed",
      });
    }

    // Create user (password will be hashed by pre-save hook in user model)
    const user = await userModel.create({
      email,
      password,
      name,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );

    // Store token in cookie
    res.cookie("token", token);

    // Send registration email
    try {
      await emailService.sendRegisterationEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  }
  

  
  catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
      status: "failed",
    });
  }
}


/** 
 *  - User login
 *  - POST /api/auth/login
 */

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );

    // Store token in cookie
    res.cookie("token", token);

    // Send login alert notification email
    try {
      await emailService.sendLoginAlertEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Failed to send login alert email:", emailErr);
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
      status: "failed",
    });
  }
}





/** 
 *  - User logout
 *  - POST /api/auth/logout
 */

async function userLogOut(req,res){
  const token=req.cookies.token || req.headers.authorization?.split(" ")[1]

  if(!token){
    return res.status(200).json({
      message:"User loggged out successfully"
    })
  }

   res.cookie("token","")

   await tokenBlackListModel.create({
    token:token
   })

   res.status(200).json({
    message: "User logged out successfully"
   })

}









module.exports = {
  userRegister, userLogin , userLogOut
};