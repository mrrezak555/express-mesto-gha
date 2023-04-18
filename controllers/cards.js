const Card = require('../models/card');

const NO_ERROR = 200;
const ERROR_CODE = 400;
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;
const FORBIDDEN = 403;

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
  }
}

const getCards = (req, res, next) => Card.find({}).populate(['owner', 'likes']).then((users) => res.status(NO_ERROR).send(users))
  .catch(
    (err) => {
      next(err);
    },
  );

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    // вернём записанные в базу данные
    .then((card) => res.send({ card }))
    // данные не записались, вернём ошибку
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

const deleteCard = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return next(new CustomError('Запрашиваемая карточка не найдена', NOT_FOUND));
      }
      const { owner } = card;
      if (owner.toString() === _id.toString()) {
        return Card.findByIdAndRemove(cardId)
          .then((cardDel) => {
            if (cardDel) {
              return res.status(NO_ERROR).send(card);
            }
            return next(new CustomError('Запрашиваемая карточка не найдена', NOT_FOUND));
          });
      }
      return next(new CustomError('У вас нет прав на удаление этой карточки', FORBIDDEN));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new CustomError('Неверный формат идентификатора карточки', NOT_FOUND);
        return next(error);
      }
      return next(err);
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => {
      if (card) {
        res.status(NO_ERROR).send(card);
      } else {
        next(new CustomError('Запрашиваемая карточка не найдена', NOT_FOUND));
      }
    })
    .catch(
      (err) => next(err),
    );
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).populate(['owner', 'likes'])
    .then(
      (card) => {
        if (card) {
          res.status(NO_ERROR).send(card);
        } else {
          next(new CustomError('Запрашиваемая карточка не найдена', NOT_FOUND));
        }
      },
    )
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          return next(new CustomError('Запрашиваемая карточка не найдена', NOT_FOUND));
        }
        return next(err);
      },
    );
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
