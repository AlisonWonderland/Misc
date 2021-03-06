const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const User = require('../models/user')
const Note = require('../models/note')


notesRouter.get('/info', async (req, res) => {
    const notes = await Note.find({})
    res.send(`Notes has ${notes.length} notes in it.<br>${new Date()}`)
})

notesRouter.get('/', async (req, res) => {
    const notes = await Note
        .find({}).populate('user', { username: 1, name: 1 })
    res.json(notes)
})

notesRouter.get('/:id', async (req, res) => {
    const note = await Note.findById(req.params.id)

    if (note) {
        res.json(note)
    }
    else {
        res.status(404).end()
    }
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

notesRouter.post('/', async (req, res) => {
    const body = req.body
    const token = getTokenFrom(req)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        date: new Date(),
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.json(savedNote)
})

notesRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    const note = {
        content: req.body.content,
        important: req.body.important,
    }

    const updatedNote = await Note.findByIdAndUpdate(id, note, { new: true })

    if(updatedNote) {
        res.json(updatedNote)
    }
    else {
        res.status(404).end()
    }
})

notesRouter.delete('/:id', async (req, res) => {
    const id = req.params.id
    const deletedNote = await Note.findByIdAndDelete(id)

    if(deletedNote) {
        res.status(204).end()
    }
    else {
        res.status(404).send({ error: 'id doesn\'t exist' })
    }
})

module.exports = notesRouter