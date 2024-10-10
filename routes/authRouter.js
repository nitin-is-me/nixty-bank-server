const express = require("express");

const router = express.Router();

const { login, signup, getAll, verifyToken, logout, userInfo, verifyOtp } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getAll", getAll);
router.post("/verifyToken", verifyToken);
router.get("/userInfo", userInfo);
module.exports = router