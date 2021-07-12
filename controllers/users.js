const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getUserMe = (req, res, next) => {
  const { _id } = req.user;
  return User.findOne({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email  } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    // eslint-disable-next-line comma-dangle
    { runValidators: true, new: true }
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          // eslint-disable-next-line comma-dangle
          { expiresIn: '7d' }
        ),
      });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  // eslint-disable-next-line object-curly-newline
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      name,
      email,
      password: hash,
    })
      .then(
        (user) =>
          // eslint-disable-next-line implicit-arrow-linebreak
          res.status(200).send({
            _id: user._id,
            name: user.name,
            email: user.email,
            // eslint-disable-next-line comma-dangle
          })
        // eslint-disable-next-line function-paren-newline
      )
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректный данные'));
        } else if (err.name === 'MongoError' && err.code === 11000) {
          next(new ConflictError('Пользователь с таким email уже существует!'));
        }
        next(err);
      });
  });
};