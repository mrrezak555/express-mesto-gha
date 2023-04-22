const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');

const NO_ERROR = 200;

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
        if (err.name === 'ValidationError') {
          next(new ValidationError('Ошибка валидации запроса'));
        } else {
          next(err);
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
        return next(new NotFoundError('Запрашиваемая карточка не найдена'));
      }
      const { owner } = card;
      if (owner.toString() === _id.toString()) {
        return Card.findByIdAndRemove(cardId)
          .then(() => res.status(NO_ERROR).send(card));
      }
      return next(new ForbiddenError('У вас нет прав на удаление этой карточки'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new ValidationError('Неверный формат идентификатора карточки');
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
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new ValidationError('Неверный формат идентификатора карточки');
        return next(error);
      }
      return next(err);
    });
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
          next(new NotFoundError('Запрашиваемая карточка не найдена'));
        }
      },
    )
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new ValidationError('Неверный формат идентификатора карточки');
        return next(error);
      }
      return next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
