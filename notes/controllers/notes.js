const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/info', async (req, res) => {
    const notes = await Note.find({})
    res.send(`Notes has ${notes.length} notes in it.<br>${new Date()}`)
})

notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.post('/', async (req, res) => {
    const body = req.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    const savedNote = await note.save()
    res.json(savedNote)
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