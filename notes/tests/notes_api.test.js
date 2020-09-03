const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')

beforeEach(async () => {
    await Note.deleteMany({})

    let noteObject = new Note(helper.initialNotes[0])
    await noteObject.save()

    noteObject = new Note(helper.initialNotes[1])
    await noteObject.save()
})

test('Notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('retrieves all the notes', async () => {
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(helper.initialNotes.length)
})

// Uses the id of the second element in initialNotes
test('retrieve a note by id. content should be \'Browser can execute only Javascript\'', async () => {
    const response = await api.get('/api/notes')
    const notes = response.body

    const testID = notes[1].id

    const getIDResponse = await api.get(`/api/notes/${testID}`)
    expect(getIDResponse.body.content).toBe(helper.initialNotes[1].content)
})

test('update note by id is succesful', async () => {
    const updatedNote = {
        content: 'This is an updated note',
        important: true
    }

    let response = await api.get('/api/notes')
    const notes = response.body
    const testID = notes[1].id

    await api
        .put(`/api/notes/${testID}`)
        .send(updatedNote)
        .expect(200)
        .expect('Content-Type', /json/)

    response = await api.get(`/api/notes/${testID}`)

    expect(response.body.content).toBe('This is an updated note')
})

// A note has not been added up to this point. So there are only 2 notes.
test('delete note by id is successful', async () => {
    let response = await api.get('/api/notes')
    const notes = response.body
    const testID = notes[1].id

    await api
        .delete(`/api/notes/${testID}`)
        .expect(204)

    response = await api.get('/api/notes')
    expect(response.body.length).toBe(helper.initialNotes.length - 1)
})

test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')
    expect(response.body[0].content).toBe('HTML is easy')
})

test('adding a note is successful through the api', async () => {
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

test('adding a note without content is unsuccessful', async () => {
    const noContentNote = {
        content: '',
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

afterAll(async () => {
    mongoose.connection.close()
})