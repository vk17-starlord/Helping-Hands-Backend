const router = require('express').Router()
const protect = require('../middleware/auth')
const authorize = require('../middleware/authAdmin')
const QuestionAnswer = require('../models/QuestionAnswer')
const User = require('../models/User')

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

router.post('/', protect, authorize('admin'),  async (req, res) => {
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

router.put('/:ques_id/:id/answers_response', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const questions = await QuestionAnswer.findById(req.params.ques_id)

        req.body.question = req.params.ques_id

        if(!user || !questions){
            return res.status(404).json({
                success: false,
                data: "Not Found!!"
            })
        }

        if(user.ques_response.question === req.params.ques_id){
            return res.status(400).json({
                success: false,
                data: "Same Question Available"
            })
        }

        if(questions._id.toString() === req.params.ques_id ){
            const user_res = await User.findByIdAndUpdate(req.params.id, req.body,{
                new: true,
                runValidators: true
            })

            res.status(200).json({
                success: true,
                data: user_res
            })
        }else{
            return res.status(400).json({
                success: false,
                data: "Something went wrong"
            })
        } 
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.delete('/:quesid', protect, authorize("admin"), async (req,res) => {
    try {
        await QuestionAnswer.findByIdAndDelete(req.params.quesid)

        res.status(200).json({
            success: true,
            data: "Question deleted Successfully"
        })
    } catch (err) {
       return res.status(500).json({err: err.message})
    }
})

router.get("/:quesid", protect, authorize("admin"), async (req,res) => {
    try {
        const question = await QuestionAnswer.findById(req.params.quesid)
        if(question){
            res.status(200).json({
                success: true,
                data: question
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

module.exports = router