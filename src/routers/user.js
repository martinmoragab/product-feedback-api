const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth');
const User = require('../models/user');
const Product = require('../models/product');

// Signup
router.post('/signup', async (req, res) => {
  const userParams = req.body.user;
  try {
    const user = await User.create(userParams);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login
router.post('/login', async (req, res) => {
  const email = req.body.credentials.email;
  const password = req.body.credentials.password;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
})

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send({ message: 'Logout successful' });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Logout all sessions
router.post('/logoutAll', auth, async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: 'Logged out from all sessions.' });
  } catch (e) {
    res.status(500).send(e);
  }
})

// Get user
router.get('/me', auth, async (req, res, next) => {
  res.send({ user: req.user });
})

// Update user by id
router.patch('/me', auth, async (req, res, next) => {
  const updates = Object.keys(req.body.user);
  try {
    const user = await User.findById(req.user._id);
    updates.forEach((update) => user[update] = req.body.user[update]);
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

// Delete user
router.delete('/me', auth, async (req, res, next) => {
  try {
    await req.user.remove();
    res.send({ user: req.user });
  } catch (e) {
    res.status(404).send(e);
  }
})

module.exports = router;