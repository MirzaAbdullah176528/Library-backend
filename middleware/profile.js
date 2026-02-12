const multer = require('multer')
const path = require('path')
const fs = require('fs')


const ProfileUploadDir = path.join(process.cwd(), 'ProfileUploads')

if (!fs.existsSync(ProfileUploadDir)) {
    fs.mkdirSync(ProfileUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ProfileUploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|jfif|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Error: Only image files are allowed!'))
    }
}

const ProfileUpload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = ProfileUpload