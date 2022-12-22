const mongoose = require('mongoose')

const QuestionAnswerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema)