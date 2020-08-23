require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
// const uniqueValidator = require('mongoose-unique-validator');
const Number = require('./models/number')

const morganTokens = ':method :url :status :res[content-length] - :response-time ms :reqData'

// middleware
morgan.token('reqData', req => {
    if(req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''
})

// const logReq = (req, res, next) => {
//     console.log("Call from logReq()")
//     next()
// }

app.use(morgan(morganTokens))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
// app.use(logReq)

// let numbers = [
//     {
//       name: "Mary Poppendieck",
//       number: "39-23-6423122",
//       id: 4
//     },
//     {
//       name: "j",
//       number: "2",
//       id: 6
//     },
//     {
//       name: "his",
//       number: "2",
//       id: 7
//     }
// ]

app.get('/', (req, res) => {
    res.send('Home page')
})

app.get('/info', (req, res) => {
    Number.find({})
        .then(numbers => {
            res.send(`Phonebook has info for ${numbers.length} people<br>${new Date()}`)
        })
})

app.get('/api/numbers', (req, res) => {
    Number.find({})
        .then(numbers => {
            res.json(numbers)
        })
})

// const generateId = () => {
//     const maxId = numbers.length > 0
//         ? Math.max(...numbers.map(number => number.id))
//         : 0

//     return maxId + 1
// }

app.post('/api/numbers', (req, res, next) => {
    const name = req.body.name
    const number = req.body.number
    
    if(!number || !name) {
        return res.status(400).json({
            error: "number and/or name are missing"
        })
    }

    // else if(numbers.find(number => number.name === name)) {
    //     return res.status(400).json({
    //         error: "Name must be unique"
    //     })
    // }

    const person = new Number({
        name: name,
        number: number
    })

    person.save().then(result => {
        res.json(result)
    })
    .catch(error => next(error))
    
})

app.get('/api/numbers/:id', (req, res, next) => {
    const id = req.params.id

    Number.findById(id)
        .then(numberFound => {
            if(numberFound)
                res.json(numberFound)
            else
                res.status(404).end()
        })
        .catch(error => next(error))
})

app.put('/api/numbers/:id', (req, res, next) => {
    const id = req.params.id
    const number = req.body

    Number.findByIdAndUpdate(id, number, { new: true })
        .then(updatedNumber => {
            if(updatedNumber) {
                res.json(updatedNumber)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/numbers/:id', (req, res, next) => {
    const id = req.params.id

    Number.findByIdAndDelete(id)
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
    console.log('error name:', error.name)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if(error.name === 'ValidationError') {
        return response.status(409).send({ error: error.message })
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
    console.log(`Listening to PORT ${PORT}.`)
})