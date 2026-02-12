const mongoos = require('mongoose')

const Model = mongoos.Schema({
    name:{type: String , required:true ,unique: true},
    
    address:{type: String , required:true},

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

const Library = mongoos.model('Library' , Model)

module.exports = Library