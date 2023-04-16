const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/index');
const { errors } = require('celebrate');

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

const app = express();
//  app.use(express.static(path.join((__dirname, 'public'))))
app.use(express.json());
app.use(errors());
app.use('/', router);
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    // Обработка ошибки валидации
    return res.status(400).send({ message: err.message });
  } if (err.name === 'MongoError' && err.code === 11000) {
    // Обработка ошибки дубликата в базе данных
    return res.status(409).send({ message: 'Такой email уже существует' });
  }
  // Обработка других ошибок
  console.error(err);
  return res.status(500).send({ message: 'Произошла ошибка на сервере' });
});

app.listen(PORT, () => {
  //  console.log(`App listening on port ${PORT}`);
});
