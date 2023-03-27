const express = require('express');
//  const path = require('path');
const mongoose = require('mongoose');
//  const bodyParser = require('body-parser');
const router = require('./routes/index');

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

const app = express();
//  app.use(express.static(path.join((__dirname, 'public'))))
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '641ff38ae21c820244802202', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});
app.use('/', router);

app.listen(PORT, () => {
  //  console.log(`App listening on port ${PORT}`);
});
