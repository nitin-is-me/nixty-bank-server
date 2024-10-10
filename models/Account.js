const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  accountNumber:{
    type: String,
    required: true,
    unique: true
  },
  balance:{
    type: Number,
    default: 6000
  }
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
