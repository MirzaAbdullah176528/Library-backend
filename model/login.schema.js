const mongoose = require('mongoose')

const loginSchema = mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false
    },
    
    avatar: {
        type: String,
        required: false
    }
})

const LoginModel = mongoose.model('Login', loginSchema)

module.exports = LoginModel