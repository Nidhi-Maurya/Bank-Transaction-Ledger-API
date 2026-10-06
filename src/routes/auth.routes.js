


const express = require('express');
const  authController = require("../controllers/auth.controller");


const router = express.Router();


 /* POST /api/auth/register */
router.post("/register", authController.userRegister);
router.post("/login", authController.userLogin);

module.exports = router