const mongoose = require('mongoose')

const AppliedSchema = new mongoose.Schema({
    job: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "Job"
        },
        user: [{
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }]
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Applied', AppliedSchema)