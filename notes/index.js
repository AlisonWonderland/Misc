require('dotenv').config()
const express = require("express")
const app = express()
const cors = require('cors')
const Note = require('./models/notes')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// const generateId = () => {
//     const max = notes.length > 0 
//         ? Math.max(...notes.map(note => note.id)) 
//         : 0

//     return max + 1
// }

// let notes = [
//     {
//       id: 1,
//       content: "HTML is easy",
//       date: "2019-05-30T17:30:31.098Z",
//       important: true
//     },
//     {
//       id: 2,
//       content: "Browser can execute only Javascript",
//       date: "2019-05-30T18:39:34.091Z",
//       important: false
//     },
//     {
//       id: 3,
//       content: "GET and POST are the most important methods of HTTP protocol",
//       date: "2019-05-30T19:20:14.298Z",
//       important: true
//     }
// ]

// app.get("/", (req, res) => {
//     res.send("<h1>hi</h1>")
// })

app.get("/info", (req, res) => {
    Note.find({})
        .then(notes => {
            res.send(`Notes has ${notes.length} notes in it.<br>${new Date()}`)
        })
})

app.get("/api/notes", (req, res) => {
    Note.find({})
        .then(notes => {
            res.json(notes)
        })
})

app.post("/api/notes", (request, response, next) => {
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

app.get('/api/notes/:id', (req, res, next) => {
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
  
app.put("/api/notes/:id", (req, res, next) => {
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

app.delete("/api/notes/:id", (req, res, next) => {
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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }  else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})