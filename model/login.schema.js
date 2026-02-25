const mongoose = require('mongoose')

const loginSchema = mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true,
        minLength: 6,
        maxLength: 30,
        match:[/^\S+$/ , 'No sapces allowed']
    },
    password: {
        type: String,
        required: true,
        unique: false,
    },
    avatar: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})


const LoginModel = mongoose.model('Login', loginSchema)

module.exports = LoginModel