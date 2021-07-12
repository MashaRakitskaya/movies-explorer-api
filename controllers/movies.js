const Movies = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movies.find({})
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.createMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN } = req.body;

  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.deleteMovies = (req, res, next) => {
  Movies.findById(req.params.movieId)
    .orFail(new Error('NotValidId'))
    .then((movie) => {
      if (req.user._id.toString() === movie.owner.toString()) {
        movie.remove();
        res.status(200).send({ message: 'Фильм удалён' });
      }
      throw new ForbiddenError('Нельзя удалять чужой фильм');
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Фильм с указанным _id не найден'));
      }
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Невалидный id'));
      }
      next(err);
    });
};