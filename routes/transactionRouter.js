const express = require("express");
const { pay, getTransactions, getTransaction } = require("../controllers/transactionController");
const router = express.Router();

router.post("/pay", pay);
router.get("/getTransactions", getTransactions);
router.get("/getTransaction/:id", getTransaction);
module.exports=router