const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const bookRouter = require('./router/books')
const librariesRouter = require('./router/libraries')
const loginRouter = require('./router/login')
const authMiddleware = require('./middleware/auth')
const AI = require('./router/ai')

const app = express()

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use('/ProfileUploads', express.static(path.join(__dirname, 'ProfileUploads')));

app.use(cors({ 
    origin: ['http://192.168.110.3:3000', 'http://localhost:3000'] 
}))

app.use(express.json())

process.env.JWT_SECRET = "my_super_secret_key"

mongoose.connect('mongodb+srv://ajjh564356165649_db_user:BMTzwYNVIqn3b1cn@cluster0.oyb8bz4.mongodb.net/MyLibraryApp?appName=Cluster0')
    .then(() => console.log('Mongo DB connected successfully'))
    .catch(err => console.log(err))

app.use('/auth', loginRouter)
app.use('/books', authMiddleware, bookRouter)
app.use('/libraries', authMiddleware, librariesRouter)
app.use('/chat', authMiddleware, AI)

app.listen(5000 , '0.0.0.0' , () => {
    console.log('Server running on port 5000')
})