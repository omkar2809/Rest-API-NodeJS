require('dotenv').config()
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
// app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(multer({ dest: 'images' , fileFilter: fileFilter }).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

const feedRoutes = require('./routes/feed')

app.use('/feed', feedRoutes)

app.use((err, req, res, next) => {
    console.log(err)
    const status = err.statusCode || 500
    const message = err.message 
    res.status(status).json({message: message})
})

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    app.listen(process.env.PORT || 3000)
})
.catch(err => console.log(err))