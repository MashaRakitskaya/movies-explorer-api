const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const validateMovie = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string()
      .required()
      .regex(/^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/),
    trailer: Joi.string()
      .required()
      .regex(/^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/),
    thumbnail: Joi.string()
      .required()
      .regex(/^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

const validateId = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().length(24).hex(),
  }),
});

const {
  getMovies,
  createMovies,
  deleteMovies,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', validateMovie, createMovies);
router.delete('/:movieId', validateId, deleteMovies);
module.exports = router;
