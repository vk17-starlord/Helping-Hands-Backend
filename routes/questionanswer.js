const router = require('express').Router()
const protect = require('../middleware/auth')
const authorize = require('../middleware/authAdmin')
const QuestionAnswer = require('../models/QuestionAnswer')

router.get('/', protect, authorize('admin'), async (req,res) => {
    try {
        const questions = await QuestionAnswer.find()
        if(questions){
            res.status(200).json({
                success: true,
                data: questions
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.post('/',  async (req, res) => {
    try {
        const {question, type_result} = req.body
        if(!question || !type_result){
            return res.status(400).json({
                success: false,
                data: "Please Enter question"
            })
        }

        const ques = await QuestionAnswer.create(req.body)
        return res.status(200).json({
            success: true,
            data: ques
        })

    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

module.exports = router