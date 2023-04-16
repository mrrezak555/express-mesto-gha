const router = require('express').Router();
const auth = require('../middlewares/auth');
const { celebrate, Joi } = require('celebrate');

const userRoutes = require('./users');
const cardRoutes = require('./cards');
const {
  login,
  createUser,
} = require('../controllers/users');

const NOT_FOUND = 404;
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = NOT_FOUND;
  }
}

const userValidationSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    about: Joi.string().min(2).max(30).default('Исследователь'),
    avatar: Joi.string().uri().default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    email: Joi.string().email().required(),
    password: Joi.string(),
  }),
};

router.use('/users', auth, celebrate(userValidationSchema), userRoutes);
router.use('/cards', auth, cardRoutes);
router.post('/signin', celebrate(userValidationSchema), login);
router.post('/signup', celebrate(userValidationSchema), createUser);
router.use((req, res, next) => {
  throw new NotFoundError('Проверьте корректность пути запроса');
});

module.exports = router; // экспортировали роуте
