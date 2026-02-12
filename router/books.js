const express = require('express')
const router = express.Router()
const Book = require('../model/books.schema')
const User = require('../model/login.schema')
const upload = require('../middleware/upload')

router.get('/', async (req, res) => {
    try {
        const filters = {}
        if(req.query.name) filters.name = new RegExp(req.query.name, 'i')
        if(req.query.category) filters.category = new RegExp(req.query.category, 'i')
        
        if(req.query.created_by) filters['Created_By.id'] = req.query.created_by

        const books = await Book.find(filters)
            .populate('library', 'name')
        
        res.json({ result: books })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        
        if (!user) {
            return res.status(404).json({ error: 'User not found. Cannot create book.' })
        }

        const bookData = {
            name: req.body.name,
            category: req.body.category,
            library: req.body.library,
            Created_By: {
                id: user._id,
                username: user.username || user.name || user.email || 'System User'
            }
        }

        if (req.file) {
            bookData.image = `/uploads/${req.file.filename}`
        }

        const newBook = new Book(bookData)
        await newBook.save()
        res.status(201).json({ message: 'Book created successfully', book: newBook })
    } catch (err) {
        console.error("Create Book Error:", err)
        res.status(400).json({ error: err.message })
    }
})

router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body }
        
        if (req.file) {
            updates.image = `/uploads/${req.file.filename}`
        }
        
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, { new: true })
        res.json({ message: 'Book updated successfully', book: updatedBook })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id)
        res.json({ message: 'Book deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router