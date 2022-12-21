const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const colors = require('colors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path');
const cors = require('cors');
dotenv.config({
    path: './config/config.env'
})

const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected', () => {
    console.log(`Database connected @27017`.cyan.bold.underline)
})

mongoose.connection.on('error', (e) => {
    console.error(`Error:  ${e.message}`.red)
})


if(process.env.ENVIRONMENT === 'development'){
    app.use(morgan('dev'))
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/user', require('./routes/user'))
app.use('/api/v1/company', require('./routes/company'))
app.use('/api/v1/job', require('./routes/job'))
app.use('/api/v1/admin', require('./routes/admin'))
app.use('/api/v1/question', require('./routes/questionanswer'))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`Server listening @PORT ${PORT}`.green.bold)
})

process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`.red.bold)
    server.close(() => process.exit(1))
})

