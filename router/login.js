const express = require('express')
const jwt = require('jsonwebtoken')
const Login = require('../model/login.schema')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const ProfileUpload = require('../middleware/profile')

const router = express.Router()
router.use(express.json())

router.post('/login', async (req, res) => {
    try {
        const { Username, password } = req.body

        if (!Username || !password) {
            return res.status(400).json({ error: "Username or password missing" })
        }

        const user = await Login.findOne({ Username: Username, isDeleted: { $ne: true } })

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        const is_match = await bcrypt.compare(password, user.password)

        if (!is_match) {
            return res.status(401).json({ error: "Invalid Password" })
        }

        const token = jwt.sign(
            {
                userId: user._id,
                Username: user.Username
            },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        )
        res.status(200).json({
            message: "Login successful",
            id: user._id,
            token,
            avatar: user.avatar
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/signup', ProfileUpload.single('image'), async (req, res) => {
    try {
        const { Username, password } = req.body

        if (!Username || !password) {
            return res.status(400).json({ error: 'Username or password is missing' })
        }

        if (typeof Username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Invalid Username or password format' })
        }

        const hashed_pass = await bcrypt.hash(password, 10)

        const userData = { Username, password: hashed_pass }

        if (req.file) {
            userData.avatar = `/ProfileUploads/${req.file.filename}`
        }

        const user = await Login.create(userData)

        res.status(201).json({
            message: 'User created successfully',
            name: user.Username,
            id: user._id,
            avatar: user.avatar
        })
    } catch (error) {
        
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Username already taken' })
        }
        res.status(400).json({ error: error.message })
    }
})

router.patch('/update/:id', ProfileUpload.single('image'), async (req, res) => {
    try {
        const id = req.params.id
        const { newUsername, newPassword } = req.body

        if (!id) {
            return res.status(400).json({ message: 'ID not provided' })
        }

        const updateData = {}

        if (newUsername) updateData.Username = newUsername

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.password = hashedPassword
        }

        if (req.file) {
            updateData.avatar = `/ProfileUploads/${req.file.filename}`
        }

        const updatedUser = await Login.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or deleted' })
        }

        const userResponse = updatedUser.toObject()
        delete userResponse.password

        return res.status(200).json({ message: 'User updated successfully', user: userResponse })

    } catch (error) {
        console.error('Update error:', error)
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
})

router.get('/profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await Login.findOne({ _id: id, isDeleted: { $ne: true } }).select('-password')

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error", error: err })
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id

        const user = await Login.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({ message: "User soft deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router