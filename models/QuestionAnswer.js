const mongoose = require('mongoose')

const QuestionAnswerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        option1: {
            type: Number,
            required: true
        },
        option2: {
            type: Number,
            required: true
        },
        option3: {
            type: Number,
            required: true
        }
    },
    type_result: {
        type: String,
        enum: ["Introvert", "Extrovert", "Arrogant", "Polite"]
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema)