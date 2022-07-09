const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw Error('Email is not valid');
      }
    }
  },
  password: {
    type: String,
    minLength: 6,
    trim: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }],
  products: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  }],
}, { timestamps: true });

// Generate JWT tokens for sign up and login
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  // Add token to user's token list
  user.tokens = user.tokens.push(token);
  await user.save();

  return token;

};

// Method to only return what's not private
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Schema method to find a user by credentials. Used for log in
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to log in');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to log in');
  }

  return user;
};

// Hash user's password to no store it as plain text
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.Model('User', userSchema);

module.exports = User;