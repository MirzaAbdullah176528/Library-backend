const mongoos = require('mongoose')

const bookSchema = mongoos.Schema({

    name: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true
    },
    library: {
        type: mongoos.Schema.Types.ObjectId,
        ref: 'Library',
        required: true
    },
    image: {
        type: String,
        required: false
    },
    Created_By: {
        username: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }

})
const Book = mongoos.model('Book', bookSchema)

module.exports = Book