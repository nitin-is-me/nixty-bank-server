const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const authRouter = require("./routes/authRouter");
const transactionRouter = require("./routes/transactionRouter");
const port = process.env.PORT || 5000
app.use(cors({
    // origin: 'http://localhost:3000',
    origin: "https://nixty-bank.vercel.app",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(cookieParser());
app.use(express.json());
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error)
    }
})();

app.use("/auth", authRouter);
app.use("/transaction", transactionRouter)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})