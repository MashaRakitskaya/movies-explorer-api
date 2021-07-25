const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new AuthError('Необходима авторизация!');
  }

  const token = extractBearerToken(authorization);
  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    throw new AuthError('Необходима авторизация!!');
  }

  req.user = payload;

  next();
};
