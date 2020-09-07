const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('notes', { content: 1, date: 1 })

    response.json(users)
})

// for password strength use regex. prob use helper func.
// check the strength in the frontend
usersRouter.post('/', async (req, res) => {
    const body = req.body

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: hashedPassword,
    })

    const savedUser = await user.save()
    res.json(savedUser)
})

module.exports = usersRouter