const express = require('express')
const User = require('../model/user')
const auth = require('../middleware/auth')

const router = express.Router()


// creating an user
router.post('/api/user', async (req,res) => {
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

// reading all the users
router.get('/api/users/me',auth, async (req,res) => {
    res.send(req.user)
})

// User login
router.post('/api/users/login', async (req,res) => {
    try{
        const email = req.body.email
        const password = req.body.password
        const user = await User.findByCredentials(email,password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

// user logout
router.post('/api/users/logout',auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send("Logged out")
    }catch(e){
        res.status(500).send(e)
    }
})


// logout all user
router.post('/api/users/logoutall',auth, async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("All users logged out")
    }catch(e){
        res.status(500).send(e)
    }
})

// updating an user
router.patch('/api/users/me',auth, async (req,res) => {
    const allowedUpdates = ['firstName','lastName','email','password']
    const updates = Object.keys(req.body)
    const isMatch = updates.every((update)=> allowedUpdates.includes(update))

    try{
        if(!isMatch){
            return res.status(400).send('Invalid Updates')
        }
        const user = req.user

        updates.forEach(update => user[update] = req.body[update])
        await user.save()
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

// Deleting an user
router.delete('/api/users/me',auth, async (req,res) => {
    try{
        // const user = req.user
        // await User.findByIdAndDelete(user._id)
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})


// reading all tasks for an user
router.get('/api/users/tasks',auth, async (req,res) => {
    const user = req.user
    await user.populate('tasks').execPopulate()
    res.send(user.tasks)
})

module.exports = router