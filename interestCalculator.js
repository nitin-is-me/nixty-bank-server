const Account = require('./models/Account');

const calculateInterest = async () => {
    const accounts = await Account.find({});
    const interestRate = 0.05;

    for (const account of accounts) {
        const interest = account.balance * interestRate;
        account.balance += interest;
        await account.save();
    }

    console.log("Interest applied to all accounts");
};

module.exports = calculateInterest;
