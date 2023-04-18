const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NO_ERROR = 200;
const ERROR_CODE = 400;
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
  }
}

const getUsers = (req, res, next) => User.find({}).then((users) => res.status(NO_ERROR).send(users))
  .catch(
    (err) => {
      next(err);
    },
  );

const getUser = (req, res, next) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (user) {
        res.status(NO_ERROR).send(user);
      } else {
        const error = new CustomError('Запрашиваемый пользователь не найден', NOT_FOUND);
        next(error);
      }
    })
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          const error = new CustomError('Ошибка валидации запроса', ERROR_CODE);
          next(error);
        } else {
          const error = new CustomError('Произошла ошибка', INTERNAL_ERROR);
          next(error);
        }
      },
    );
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      user.password = undefined;
      res.send({ user });
    })
    .catch(
      (err) => {
        next(err);
      },
    );
};

const updateUser = (req, res, next) => {
  // обновим имя найденного по _id пользователя
  const owner = req.user._id;
  User.findByIdAndUpdate(owner, req.body, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
  })
    .then((user) => res.status(NO_ERROR).send(user))
    .catch(
      (err) => {
        next(err);
      },
    );
};

const updateAvatar = (req, res, next) => {
  const owner = req.user._id;
  User.findByIdAndUpdate(owner, req.body.avatar, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
  })
    .then(() => res.send({ data: req.body }))
    .catch(
      (err) => {
        next(err);
      },
    );
};

const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;
  User.find({ email }).select('+password')
    .then((userData) => {
      if (!userData[0]) {
        return next(new Error('Неправильные почта или пароль'));
      }
      bcrypt.compare(password, userData[0].password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            return next(new Error('Что-то не так с почтой или паролем'));
          }
          const jwtToken = jwt.sign({ _id: userData[0]._id }, 'super-strong-secret', { expiresIn: '7d' });
          // аутентификация успешна
          return res.send({ token: jwtToken });
        })
        .catch(
          (err) => {
            next(err);
          },
        );
    });
};

const getCurrentUser = (req, res, next) => {
  const {
    _id,
  } = req.user;
  User.findById({ _id })
    .then((userData) => {
      res.status(200).send({ userData });
    })
    .catch(
      (err) => {
        next(err);
      },
    );
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getCurrentUser,
};
