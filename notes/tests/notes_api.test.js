const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')
const User = require('../models/user')

// This will be executed after a single test is done
beforeEach(async () => {
    await Note.deleteMany({})
    console.log('cleared all notes from test database')

    const noteObjects = helper.initialNotes
        .map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
    await Promise.all(promiseArray)

    console.log('done initializing test database')
})

describe('when the notes database has been initialized', () => {
    test('Notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('the first note is about HTTP methods', async () => {
        const response = await api.get('/api/notes')
        expect(response.body[0].content).toBe('HTML is easy')
    })

    test('retrieves all the notes', async () => {
        const response = await api.get('/api/notes')
        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('find a note within the returned notes.', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(r => r.content)
        expect(contents).toContain(
            'Browser can execute only Javascript'
        )
    })
})

describe('getting a specific note', () => {
    test('retrieve a note by valid id.', async () => {
        const notes = await helper.notesInDb()
        const testID = notes[1].id

        const getIDResponse = await api
            .get(`/api/notes/${testID}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(getIDResponse.body).toEqual(JSON.parse(JSON.stringify(notes[1])))
    })

    test('api returns 404 status code if note doesn\'t exist anymore', async () => {
        const nonExistentID = await helper.nonExistingId()

        await api
            .get(`/api/notes/${nonExistentID}`)
            .expect(404)
    })

    test('api returns 400 status code if id is invalid', async () => {
        const invalidID = '5a3d5da59070081a82a3445'

        await api
            .get(`/api/notes/${invalidID}`)
            .expect(400)
    })

})

describe('updating a note', () => {
    test('update note with valid id is succesful', async () => {
        const updatedNote = {
            content: 'This is an updated note',
            important: true
        }

        const notes = await helper.notesInDb()
        const testID = notes[1].id

        await api
            .put(`/api/notes/${testID}`)
            .send(updatedNote)
            .expect(200)
            .expect('Content-Type', /json/)

        const notesAtEnd = await helper.notesInDb()
        const contents = notesAtEnd.map(note => note.content)

        expect(contents).toContain('This is an updated note')
    })

    test('update note with nonexisting id returns 404', async () => {
        const updatedNote = {
            content: 'This is an updated note',
            important: true
        }

        const nonExistentID = await helper.nonExistingId()

        await api
            .put(`/api/notes/${nonExistentID}`)
            .send(updatedNote)
            .expect(404)
    })

    test('update note with invalid id returns 400', async () => {
        const updatedNote = {
            content: 'This is an updated note',
            important: true
        }

        const invalidID = '5a3d5da59070081a82a3445'

        await api
            .put(`/api/notes/${invalidID}`)
            .send(updatedNote)
            .expect(400)
    })
})

describe('adding a new note', () => {
    test('adding a valid note is successful through the api', async () => {
        const testNote = {
            content: 'This is a test note',
            date: new Date(),
            important: true
        }

        await api
            .post('/api/notes/')
            .send(testNote)
            .expect(200)
            .expect('Content-Type', /json/)

        const notesAfterPost = await helper.notesInDb()
        const contents = notesAfterPost.map(note => note.content)

        expect(contents).toContain('This is a test note')
        expect(notesAfterPost).toHaveLength(helper.initialNotes.length + 1)
    })

    test('adding a note without content is unsuccessful and return 400 status code', async () => {
        const noContentNote = {
            date: new Date(),
            important: false
        }

        await api
            .post('/api/notes')
            .send(noContentNote)
            .expect(400)

        const notesAfterPost = await helper.notesInDb()
        expect(notesAfterPost).toHaveLength(helper.initialNotes.length)
    })

    test('adding a note without a date is unsuccessful and return 400 status code', async () => {
        const noContentNote = {
            content: '',
            important: false
        }

        await api
            .post('/api/notes')
            .send(noContentNote)
            .expect(400)

        const notesAfterPost = await helper.notesInDb()
        expect(notesAfterPost).toHaveLength(helper.initialNotes.length)
    })
})

describe('deleting notes', () => {
    test('delete note with valid id is successful', async () => {
        const notes = await helper.notesInDb()
        const testID = notes[1].id

        await api
            .delete(`/api/notes/${testID}`)
            .expect(204)

        const notesAfterDelete = await helper.notesInDb()
        expect(notesAfterDelete).toHaveLength(helper.initialNotes.length - 1)
    })

    test('delete note with nonexisting id returns 404', async () => {
        const nonExistingId = await helper.nonExistingId()

        await api
            .delete(`/api/notes/${nonExistingId}`)
            .expect(404)
    })

    test('delete note with invalid id returns 400', async () => {
        const invalidID = '5a3d5da59070081a82a3445'

        await api
            .delete(`/api/notes/${invalidID}`)
            .expect(400)
    })
})

// User Tests

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

afterAll(async () => {
    mongoose.connection.close()
})