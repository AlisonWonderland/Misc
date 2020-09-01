const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/info', (req, res) => {
    Note.find({})
        .then(notes => {
            res.send(`Notes has ${notes.length} notes in it.<br>${new Date()}`)
        })
})

notesRouter.get('/', (req, res) => {
    Note.find({})
        .then(notes => {
            res.json(notes)
        })
})

notesRouter.post('/', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
})

notesRouter.get('/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

notesRouter.put('/:id', (req, res, next) => {
    const id = req.params.id
    const note = {
        content: req.body.content,
        important: req.body.important,
    }

    Note.findByIdAndUpdate(id, note, { new: true })
        .then(updatedNote => {
            if(updatedNote) {
                res.json(updatedNote)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

notesRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id

    Note.findByIdAndDelete(id)
        .then(deletedNote => {
            if(deletedNote) {
                res.status(204).end()
            } else {
                res.status(404).send({ error: 'id doesn\'t exist' })
            }
        })
        .catch(error => next(error))
})

module.exports = notesRouter