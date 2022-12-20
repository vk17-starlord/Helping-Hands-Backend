const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add a email'],
        unique: [true, 'User Already exists'],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        select: false
    },
    role: {
       type: String,
       enum: ['user','companyuser','admin'],
       default: 'user' 
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    certificate: {
        type: String,
        default: 'no-file'
    },
    photo: {
        type: String,
        default: 'no-file'
    },
    applied: [{
        job: {
            type: mongoose.Schema.ObjectId,
            ref: 'Job'
        },
        status: {
            type: String,
            enum: ["Applied", "Under Review", "Hired", "Not Selected"],
            default: "Applied"
        }
    }]
}, {
    timestamps: true
})

UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

module.exports = mongoose.model('User', UserSchema)

