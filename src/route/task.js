const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../model/task')

const router = express.Router()

router.post('/api/tasks', auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }

})

// reading a tasks for a particular user
router.get('/api/tasks',auth, async (req,res) => {
    try{
        // const tasks = await Task.find({owner: req.user._id})
        // if(tasks.length === 0){
        //     res.status(404).send()
        // }
        // res.send(tasks)
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(400).send(e)
    }
})

// reading task with ID
router.get('/api/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        await task.populate('owner').execPopulate()
        res.send(task)
    }catch(e){
        res.status(400).send()
    }
})

// update a task by ID
router.patch('/api/tasks/:id',auth, async (req,res) => {
    const allowedUpdates = ['description','completed']
    const updates = Object.keys(req.body)
    const isMatch = updates.every((update) => allowedUpdates.includes(update))

    if(!isMatch){
        return res.status(400).send("Invalid Updates!")
    }
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// Deleting a task by ID
router.delete('/api/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})


module.exports = router