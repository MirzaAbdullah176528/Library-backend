const express = require('express')
const Library = require('../model/libraries.schema')
const mongoos = require('mongoose')
const Books = require('../model/books.schema')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const User = require('../model/login.schema')

router.use(express.json())

router.get('/', async (req, res) => {
    try {
        const { name, address } = req.query

        let query = {}

        if (name) {
            query.name = { $regex: name, $options: 'i' }
        }
        if (address) {
            query.address = { $regex: address, $options: 'i' }
        }
        const library = await Library.find(query)
        if (library) {
            return res.status(200).json(library)
        }

    } catch(error) {
        res.status(400).json({
            Error: error.message
        })
    }

})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, address } = req.body;
        
        const { userId } = req.user 

        if (!name || !address) {
            return res.status(400).json({ error: 'Name and address are required' })
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const library = await Library.create({
            name,
            address,
            Created_By: {
                username: user.Username, 
                id: userId
            }
        })

        return res.status(201).json(library)

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const library = await Library.findByIdAndDelete(id)

        if (!library) {
            return res.status(404).json({ error: 'Id not match' })
        }
        res.status(200).json(library)
    }
    catch (error) {
        res.status(500).json({ error: "internal server err" })
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { name, address } = req.body

        const updatedLibrary = await Library.findByIdAndUpdate(
            id,
            { name, address },
            { new: true, runValidators: true }
        )

        if (!updatedLibrary) {
            return res.status(404).json({ error: 'Library not found' })
        }

        res.status(200).json(updatedLibrary)

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format" })
        }
        res.status(500).json({ error: error.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params
        const result = await Library.findById(id)

        if (!result) {
            return res.status(400).json({
                error: 'No match found'
            })
        }
        res.status(200).json(result)
    } catch(error) {
        res.status(500).json({
            error:error.message
        })
    }
})


router.get('/:id/books',async (req, res) => {
    try {
        const {id} = req.params
        const result = await Books.find({ library: id }).populate('library')

        if (result) {
            return res.status(200).json({
                found: result.length,
                books: result
            })
        }

        res.status(404).json({
            message: 'no book found'
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})
module.exports = router