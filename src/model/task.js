const mongoose = require('mongoose')

const Task = mongoose.model('task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: String,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
})


module.exports = Task