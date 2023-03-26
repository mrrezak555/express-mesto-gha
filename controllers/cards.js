const Card = require('../models/card')


const getCards = (req, res) => {
  return Card.find({}).then(users => res.status(200).send(users))
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else {
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id
  Card.create({ name, link, owner })
    // вернём записанные в базу данные
    .then(card => res.send({ card }))
    // данные не записались, вернём ошибку
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else {
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  const num = parseInt(cardId);

  if (isNaN(num)) {
    return res.status(400).send({ message: 'Ошибка валидации запроса' })
  }
  Card.findByIdAndRemove(cardId)
    .then(card => {
      if (card) {
        res.status(200).send(card)
      }
      else {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' })
      }
    })
    .catch(
      (err) => {
        const ERROR_CODE = 404;
        if (err.name === 'CastError') {
          return res.status(ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' })
        }
        else {
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const likeCard = (req, res) => {

  const num = parseInt(req.params.cardId);

  if (isNaN(num)) {
    return res.status(400).send({ message: 'Ошибка валидации запроса' })
  }
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then(card => {
      if (card) {
        res.status(200).send(card)
      }
      else {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' })
      }
    })
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else if (err.name === 'CastError') {
          return res.status(404).send({ message: 'Запрашиваемая карточка не найдена' })
        }
        else {
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const dislikeCard = (req, res) => {
  const num = parseInt(req.params.cardId);

  if (isNaN(num)) {
    return res.status(400).send({ message: 'Ошибка валидации запроса' })
  }
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then(
      card => {
        if (card) {
          res.status(200).send(card)
        }
        else {
          res.status(404).send({ message: 'Запрашиваемая карточка не найдена' })
        }
      }
    )
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError') {
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else if (err.name === 'CastError') {
          return res.status(404).send({ message: 'Запрашиваемая карточка не найдена' })
        }
        else {
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
}