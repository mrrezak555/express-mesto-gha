const router = require('express').Router();

const userRoutes = require('./users');
const cardRoutes = require('./cards');

const NOT_FOUND = 404;

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Проверьте корректность пути запроса' });
});

module.exports = router; // экспортировали роуте
