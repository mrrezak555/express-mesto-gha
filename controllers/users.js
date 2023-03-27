const User = require('../models/user');

const NO_ERROR = 200;
const ERROR_CODE = 400;
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;

const getUsers = (req, res) => User.find({}).then((users) => res.status(NO_ERROR).send(users))
  .catch(
    () => {
      res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
    },
  );

const getUser = (req, res) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (user) {
        res.status(NO_ERROR).send(user);
      } else {
        res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
    })
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    // вернём записанные в базу данные
    .then((user) => res.send({ user }))
    // данные не записались, вернём ошибку
    .catch(
      (err) => {
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

const updateUser = (req, res) => {
  // обновим имя найденного по _id пользователя
  const owner = req.user._id;
  User.findByIdAndUpdate(owner, req.body, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
  })
    .then((user) => res.status(NO_ERROR).send(user))
    .catch(
      (err) => {
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

const updateAvatar = (req, res) => {
  const owner = req.user._id;
  User.findByIdAndUpdate(owner, req.body)
    .then(() => res.send({ data: req.body }))
    .catch(
      (err) => {
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
};
