const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Book = require('../model/books.schema')

beforeAll(async () => {
    await mongoose.connect('mongodb+srv://ajjh564356165649_db_user:BMTzwYNVIqn3b1cn@cluster0.oyb8bz4.mongodb.net/MyLibraryApp?appName=Cluster0')
})

afterEach(async () => {
    await Book.deleteMany({})
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('GET /books', () => {

    it('should return all books', async () => {
        await Book.create({ name: 'Book A', category: 'Tech' })
        await Book.create({ name: 'Book B', category: 'Food' })

        const res = await request(app).get('/books')

        expect(res.statusCode).toBe(200)
    }, 10000)

    it('should filter by name', async () => {
        await Book.create({ name: '1984', category: 'Political fiction' })
        await Book.create({ name: 'Animal Farm', category: 'Political fiction' })

        const res = await request(app).get('/books').query({ name: '1984' })

        expect(res.statusCode).toBe(200)
        expect(res.body.total_res).toBe(1)
        expect(res.body.results[0].name).toBe('1984')
    })

    it('should return 404 when no data is found', async () => {
        const res = await request(app).get('/books')

        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual([])
    })
})

describe('POST /books', () => {

    it('should create a new book', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                name: 'Animal farm',
                category: 'book'
            })

        expect(res.statusCode).toBe(201)

        expect(res.body.name).toBe('Animal farm')
        expect(res.body.category).toBe('book')
        expect(res.body._id).toBeDefined()
    })

    it('should return 400 if name or category is missing', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                name: 'Incomplete Book'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe('Name, id, or category is missing')
    })

})

describe('Delete /books', () => {
    it('Should delete the book', async () => {
        const book = await Book.create({ name: '1984', category: 'Political fiction' })
        const id = book._id
        const res = await request(app)
            .delete('/books/' + id)

        expect(res.statusCode).toBe(200)
        expect(res.body._id).toBeDefined()
    })
})

describe('Get by ID /books/:id', () => {

    it('Should get the book by Id', async () => {
        const book = await Book.create({ name: 'Animal farm', category: 'Political fiction' })
        const id = book._id

        const res = await request(app).get('/books/' + id)
        expect(res.status).toBe(200)
        expect(res.body.found.name).toBe('Animal farm')
    })
})

describe('Update the book /book', () => {
    it('Should update the book', async () => {
        const book = await Book.create({ name: 'Animal farm', category: 'Political fiction' })
        const id = book._id

        const res = await request(app).patch('/books/' + id)
            .send({ name: '1984', category: 'book' })

        console.log(res.body);
        expect(res.status).toBe(200)
        expect(res.body.category).toBe('book')

    })
})