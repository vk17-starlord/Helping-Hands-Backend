const mongoose = require('mongoose')

const QuestionAnswerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type_result: {
        type: String,
        enum: ["Introvert", "Extrovert", "Arrogant", "Polite"]
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema)