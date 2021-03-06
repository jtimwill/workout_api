const config = require('config');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  email: { // To do: add regex for better validations
    type: String,
    maxlength: 255,
    required: true,
    unique: true
  },
  password_digest: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const secret = config.get('jwt_private_key');
  return jwt.sign({ 
    _id: this._id, admin: this.admin 
  }, secret/*, { expiresIn: '1h' }*/);
};

const User = mongoose.model('User', userSchema);
module.exports = User;