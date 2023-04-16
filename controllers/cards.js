const Card = require('../models/card');

const NO_ERROR = 200;
const ERROR_CODE = 400;
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;
const FORBIDDEN = 403;

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
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      const { owner } = card;
      if (owner.toString() === _id.toString()) {
        return Card.findByIdAndRemove(cardId)
          .then((cardDel) => {
            if (cardDel) {
              return res.status(NO_ERROR).send(card);
            }
            return res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
          });
      }
      return res.status(FORBIDDEN).send({ message: 'У вас нет прав на удаление этой карточки' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND).send({ message: 'Неверный формат идентификатора карточки' });
      }
      return res.status(FORBIDDEN).send({ message: 'Нельзя удалять чужие карточки' });
    });
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
      (err) => res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' }),
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
