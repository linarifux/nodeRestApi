const express = require('express')
const DB = require('./src/db/db')
const userRouter = require('./src/route/user')
const taskRouter = require('./src/route/task')
const port = process.env.PORT || 3000

const app = express()

app.listen(port, ()=> console.log('Server started: '+port))


// Middlewares

// Json parser
app.use(express.json())


// user route
app.use(userRouter)

// Task route
app.use(taskRouter)











app.get('/', (req,res) => {
    res.send("Task App")
})