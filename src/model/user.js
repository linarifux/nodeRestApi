const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error('Invalid Email Address!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate(pass){
            if(pass.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
        }
    }]
})

userSchema.virtual('tasks', {
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
})

// Hashing password before saving user
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Deleting all the tasks associated with the user when the user is deleted
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})


// Generating Authentication token
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'voidarif')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


// Hiding password and tokens from the user object
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// verify User by credentials
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email})
    
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login') 
    }

    return user
}

const User = mongoose.model('user',userSchema)

module.exports = User