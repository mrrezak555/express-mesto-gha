const User = require('../models/user')


const getUsers = (req, res) => {
  return User.find({}).then(users => res.status(200).send(users))
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError'){
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else{
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}
const getUser = (req, res) => {
  const { id } = req.params;

  return User.findById(id)
    .then(user => {
      if (user){
        res.status(200).send(user)
      }
      else{
        res.status(404).send({ message: 'Запрашиваемый пользователь не найден' })
      }
    })
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'CastError'){
          return res.status(ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' })
        }
        else{
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
    }
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    // вернём записанные в базу данные
    .then(user => res.send({ user }))
    // данные не записались, вернём ошибку
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError'){
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else{
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const updateUser = (req, res) => {
  // обновим имя найденного по _id пользователя
  const owner = req.user._id
  User.findByIdAndUpdate(owner, req.body, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true // данные будут валидированы перед изменением
} )
    .then(user => res.status(200).send(user))
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError'){
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else if (err.name === 'CastError'){
          return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' })
        }
        else{
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

const updateAvatar = (req, res) => {
  const owner = req.user._id
  User.findByIdAndUpdate(owner, req.body)
    .then(user => res.send({ data: req.body }))
    .catch(
      (err) => {
        const ERROR_CODE = 400;
        if (err.name === 'ValidationError'){
          return res.status(ERROR_CODE).send({ message: 'Ошибка валидации запроса' })
        }
        else if (err.name === 'CastError'){
          return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' })
        }
        else{
          res.status(500).send({ message: 'Произошла ошибка' })
        }
      });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar
}