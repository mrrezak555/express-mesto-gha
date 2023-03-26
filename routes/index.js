const router = require('express').Router();

const userRoutes = require('./users');
const cardRoutes = require('./cards');

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use((req, res) =>{
  res.status(404).send({ message: 'Проверьте корректность пути запроса' })
});

module.exports = router; // экспортировали роутер

