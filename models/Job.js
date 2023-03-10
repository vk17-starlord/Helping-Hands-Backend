const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    j_name: {
        type: String,
        required:[true, "Please provide a Job Name"],
        trim: true,
        minLength: [2, "Name must contain atleast 2 characters"],
        maxLength: [50, 'Name must be atmost 50 characters long']
    },
    j_desc: {
        type: String,
        required: [true, "Please Enter Your Job Description"],
        maxLength: [500,'Job Description must not exceed 500 characters']
    },
    j_mode: {
        type: String,
        enum: ["Work From Home", "Offline","Hybrid"],
        default: "offline"
    },
    j_duedate: {
        type: Date,
        required: [true,"Please provide the last date to fill the job"]
    },
    j_applicants: {
        type: Number
    },
    j_skills: [{
        type: String,
        required: [true, "Please provide skills required for the job"]
    }],
    j_whocanapply: {
        type: [String],
        enum: ['Locomotor Disability','Visual Impairment','Hearing Impairment','Intellectual Disability','Multiple Disabilities'],
        required: [true, "Please Provide the Categories of people who can apply"]
    },
    j_openings: {
        type: Number,
        required: [true, "Please provide the number of openings"]
    },
    j_selectedusers: {
        type: Number,
        default: 0
    },
    j_applied: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ["Applied", "Under Review", "Hired", "Not Selected"],
            default: "Applied"
        }
    }]    ,
   j_salary: {
        type: Number,
        required: [true, "Please provide the salary"]
    },
    j_validAge: {
        type: Number,
        required: [true, "Please provide the valid age"]
    },
    j_resultType: {
        type: [String],
        default: ["Introvert", "Extrovert", "Arrogant", "Polite"]
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Job', JobSchema)