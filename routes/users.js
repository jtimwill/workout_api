const express = require('express');
const router = express.Router();
const mongooose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/objectId_validation');

router.get('/', [auth, admin], async (req, res) => {
  const users = await User.find().sort('name');
  res.send(users);
});

router.post('/', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const password_digest = await bcrypt.hash(password, salt);
  
  let user = new User({ name: name, email: email, password_digest: password_digest});
  const found_user = await User.findOne({ email: req.body.email });

  if (found_user){ 
    return res.status(400).send('Email exists already'); 
  }
  
  try { 
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(400).send(err);
  } 
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password_digest -remember_digest');
  res.send(user);
});

// router.put('/me', auth, async (req, res) => {
//   // const old_user = await User.findById(req.user._id);
//   // const name = req.body.name || old_user.name;
//   // const email = req.body.email || old_user.email;
//   // const password = req.body.name || old_user.password;

//   // const salt = await bcrypt.genSalt(10);
//   // const password_digest = await bcrypt.hash(req.body.password, salt);
//   // const user = await User.findByIdAndUpdate(req.user._id, {
//   //   name: req.body.name,
//   //   email: req.body.email,
//   //   password_digest: password_digest
//   // }, new: true);
//   // res.send(user);

// });

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) {
    return res.status(404).send('User ID not found');
  } else {
    res.send(user);
  }
});

module.exports = router;