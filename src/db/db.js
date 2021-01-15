const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/taskapp', {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, ()=> console.log('DB connected....'))


module.exports = mongoose