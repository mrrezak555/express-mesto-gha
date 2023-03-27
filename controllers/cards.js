const Card = require('../models/card');

const NO_ERROR = 200;
const ERROR_CODE = 400;
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;

const getCards = (req, res) => Card.find({}).populate(['owner', 'likes']).then((users) => res.status(NO_ERROR).send(users))
  .catch(
    () => {
      res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
    },
  );

const createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    // вернём записанные в базу данные
    .then((card) => res.send({ card }))
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

const deleteCard = (req, res) => {
  const { cardId } = req.params;

  return Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (card) {
        return res.status(NO_ERROR).send(card);
      }
      return res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
    })
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          return res.status(ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => {
      if (card) {
        res.status(NO_ERROR).send(card);
      } else {
        res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      }
    })
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          return res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
      },
    );
};

const dislikeCard = (req, res) => {
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
          res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
        }
      },
    )
    .catch(
      (err) => {
        if (err.name === 'CastError') {
          return res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
        }
        return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
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
