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

router.post('/', protect ,  async (req, res) => {
    try {
        const {question} = req.body
        if(!question){
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

router.put('/addAnswerResponse/:id', protect , async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(200).json({success:false,error:"Invalid User"})
        }

        if(!req.body.question || !req.body.answer){
            return res.status(200).json({success:false,error:"Please Enter All Fields"})
        }

        const {question,answer} = req.body;


        const Validquestion = await QuestionAnswer.findById(req.body.question)
        
        if(Validquestion){
           
          await User.updateOne(
                {_id:req.params.id},
                { $push: { ques_response: { question,answer} } }
            )

        }


        return res.status(200).json({success:true,body:question})
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