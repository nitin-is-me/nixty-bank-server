const Account = require("../models/Account");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const tempUsers = {};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "bloodyrookie123@gmail.com",
            pass: process.env.PASS,
        },
    });

    const mailOptions = {
        from: "bloodyrookie123@gmail.com",
        to: email,
        subject: 'Nixty Bank Verification',
        text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

exports.signup = async (req, res) => {
    const { username, name, password, email } = req.body;
    if (await Account.findOne({ username: username })) {
        return res.status(400).send("Username already exists!");
    }
    if (await Account.findOne({ email: email })) {
        return res.status(400).send("Email already in use");
    }

    const otp = generateOtp();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    tempUsers[username] = { username, name, password, email, otp, otpExpiration };

    try {
        await sendOtpEmail(email, otp);
        console.log("OTP sent to:", email);
        res.status(200).send("OTP sent to your mail");
    } catch (error) {
        console.log("Error sending OTP:", error);
        res.status(500).send("Error sending OTP, please try again");
    }
};

exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;
    const tempUser = tempUsers[username];
    if (!tempUser) {
        return res.status(400).send("User not found or OTP not requested");
    }

    if (tempUser.otpExpiration < Date.now()) {
        delete tempUsers[username];
        return res.status(400).send("OTP has expired");
    }

    if (String(tempUser.otp).trim() !== String(otp).trim()) {
        return res.status(400).send("Invalid OTP");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tempUser.password, salt);
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const newAccount = new Account({
        username: tempUser.username,
        name: tempUser.name,
        password: hash,
        accountNumber,
        email: tempUser.email
    });

    await newAccount.save();
    delete tempUsers[username];

    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Account.findOne({ username });
        if (!user) {
            return res.status(400).send("Username doesn't exist, try signing up instead");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ username: user.username, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Sending token in response instead of cookie
            return res.json({ token });
        } else {
            return res.status(400).send("Wrong password, try again");
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send("Internal server error");
    }
};

exports.logout = (req, res) => {
    res.send("Logged out. Please remove the token from local storage.");
};

exports.getAll = async (req, res) => {
    const users = await Account.find();
    res.json(users);
};

exports.verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(req.headers);
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).send('User is unauthorized');
        }
        return res.status(200).send("User is authorized");
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'User is unauthorized' });
    }
};

exports.userInfo = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).send('User is unauthorized');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.username;
        const foundUser = await Account.findOne({ username });
        const { name, balance, accountNumber, email } = foundUser;
        res.json({ name, username, balance, accountNumber, email });
    } catch (error) {
        return res.status(401).send('User is unauthorized');
    }
};
