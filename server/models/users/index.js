const express = require('express');
const router = express.Router();
const config = require ('../../../nuxt.config.js');

const secured = require('express-jwt');
const hasRoles = require('../HasRoles');
const API_Error = require('../ApiError');

const User = require('./User');
const Invitation = require('../invitations/Invitation');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', secured({secret: config.server.jwtSecret}), hasRoles(['admin']), async (req, res, next) => {
  try {
    const users = await User.find()
      .select('_id username person roles')
      .populate('person')
      .exec();
    res.send({ users });
  } catch (err) {
    next(err);
  }
});


router.post('/add', secured({secret: config.server.jwtSecret}), hasRoles(['admin']), async (req, res, next) => {

  const user = req.body.user;

  try {
    if (!user) throw API_Error('ADD_USER_ERROR', 'New user data invalid.');

    const newUser = new User(user);
    let returnedUser = await newUser.save();
    res.send({ user: returnedUser });

  } catch (err) {
    if (err.code === 11000) next(API_Error('ADD_USER_ERROR', 'Username already in use.'));
    else if (err.name === 'ValidationError') next(API_Error('ADD_USER_ERROR', 'New user data invalid.'));
    else next(err);
  }
});

router.post('/register', async (req, res, next) => {

  const { user } = req.body;

  try {

    if (!user || !'username' in user || !'password' in user)  throw API_ERROR('REGISTRATION_ERROR', 'Invalid registration details.');
    if (!user.inviteCode) throw API_Error('REGISTRATION_ERROR', 'An invitation code is required to register.');

    const invitation = await Invitation.findById(user.inviteCode).exec();

    if (!invitation) throw API_Error('REGISTRATION_ERROR', 'Invitation was not found.');
    if (invitation.user) throw API_ERROR('REGISTRATION_ERROR', 'Invitation is invalid.');

    const { username, password } = user;

    if (username.length < 4 || username.length > 15) throw API_Error('REGISTRATION_ERROR', 'Username must be between 4 and 15 characters.');
    if (password.length < 6) throw API_Error('REGISTRATION_ERROR', 'The password must be 6 or more characters.');

    let hash = await bcrypt.hash(password, 10);

    let newUser = new User({ username, hash });

    let saved = await newUser.save();

    if (saved) {
      invitation.used = true;
      invitation.usedBy = saved._id;
      invitation.save();
    } 

    res.sendStatus(200);

  } catch (err) {
    if (err.code === 11000) next(API_Error('REGISTRATION_ERROR', 'Username already in use.'));
    else next(err);
  }
});

router.get('/user', secured({secret: config.server.jwtSecret}), async (req, res, next) => {
  try {
    const { user } = req;
    if (user && '_id' in user) {
      const data = await User.findById(user._id);
      if (data) {
        const { username, roles } = data;
        res.send({ user: {
          username,
          roles
        }});
      } else {
        throw new API_Error('AUTHENTICATION_ERROR', 'User with provided ID was not found.');
      }
    } else {
      throw new API_Error('AUTHENTICATION_ERROR', 'User ID not provided.');
    } 
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!('user' in req.body)) throw API_Error('LOGIN_ERROR', 'The login request was invalid.');
    const { user } = req.body;
    if (!('username' in user) || !('password' in user)) throw API_Error('LOGIN_ERROR', 'A username and password is required.');
    const foundUser = await User.findOne({ username: user.username }).exec();
    if (!foundUser) throw API_Error('LOGIN_ERROR', 'Username not found.');
    const validPassword = await bcrypt.compare(String(user.password), foundUser.hash);
    if (!validPassword) throw API_Error('LOGIN_ERROR', 'Incorrect password.');
    const token = jwt.sign({ username: foundUser.username, _id: foundUser._id, roles: foundUser.roles }, config.server.jwtSecret);
    res.send({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  if ('user' in req) delete req.user;
  res.sendStatus(500);
});


router.get('/:id', secured({secret: config.server.jwtSecret}), hasRoles(['admin']), async (req, res, next) => {
  const id = req.params.id;
  try {
    let user = await User.findById(id)
      .select('_id username scope')
      .exec();

    res.send({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', secured({secret: config.server.jwtSecret}), hasRoles(['admin']), async(req, res, next) => {

  const id = req.params.id;
  const userData = req.body.user;

  try {
    if (!userData) throw API_Error('UPDATE_USER_ERROR', 'New user data invalid.');
    let updatedUser = await User.findByIdAndUpdate(id, userData)
      .select('_id username scope')
      .exec();
    res.send(updatedUser);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', secured({secret: config.server.jwtSecret}), hasRoles(['admin']), async (req, res, next) => {
  const id = req.params.id;

  try {
    let deletedUser = await User.findByIdAndRemove(id);
    res.send({ user: deletedUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
