const router = require('express').Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/authAdmin');
const Applied = require('../models/Applied');
const Company = require('../models/Company');
const Job = require('../models/Job');
const User = require('../models/User');

router.get('/', async (req,res) => {
    try {
        const job = await Job.find();
        if(job){
            res.status(200).json({
                success: true,
                count: job.length,
                data: job
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.get('/:companyid/jobs', async (req,res) => {
    try {

        const job = await Job.find({company: req.params.companyid})
        if(job){
            res.status(200).json({
                success: true,
                count: job.length,
                data: job 
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.get('/:id', async (req,res) => {
    try {
        const job = await Job.findById(req.params.id)
        if(!job){
            return res.status(400).json({
                success: false,
                data: `Job with ${req.params.id} not found`
            })
        }

        res.status(200).json({
            success: true,
            data: job
        })


    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.post('/:companyid/createjob', protect, authorize("companyuser", "admin"), async (req,res) => {
    try {
        req.body.company = req.params.companyid
        // const {j_name, j_desc, j_mode, j_duedate, j_skills, j_whocanapply, j_openings, j_salary, j_validAge} = req.body
        const company = await Company.findById(req.params.companyid)
        if(!company){
            return res.status(400).json({
                success: false,
                error: `Company with ${req.params.companyid} not found`
            })
        }

        if(company.user.toString() !== req.user.id){
            return res.status(400).json({
                success: false,
                error: `User ${req.user.id} is not authorized to update this company`
            })
        }

        if(company.c_isVerified === true){
            const job = await Job.create(req.body)
    
            res.status(201).json({
                success: true,
                data: job,
                message: "Job created successfully"
            })    
        }else{
            res.status(200).json({
                success: true,
                error: "Company is not Verified yet... You can Post the job once your company is verified."
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.put('/:companyid/update/:id', protect, authorize("companyuser", "admin"), async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyid)
        if(!company){
            return res.status(400).json({
                success: false,
                data: `Company with ${req.params.companyid} not found`
            })
        }

        if(company.user.toString() !== req.user.id){
            return res.status(400).json({
                success: false,
                data: `User ${req.user.id} is not authorized to update this company`
            })
        }

        if(company._id.toString() !== req.params.companyid){
            return res.status(400).json({
                success: false,
                data: `Job with ${req.params.id} does not exists for Company with ${req.params.companyid}`
            })
        }

        if(company.c_isVerified === true){
            const job = await Job.findById(req.params.id)
            if(!job){
                return res.status(400).json({
                    success: false,
                    data: `Job with ${req.params.id} not found`
                })
            }

            const newjob = await Job.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            })

            res.status(200).json({
                success: true,
                data: newjob,
                message: "Job Updated Successfully"
            })
        }else{
            res.status(200).json({
                success: true,
                data: "Company is not Verified yet... You can Post the job once your company is verified."
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.delete('/:companyid/delete/:id', protect, authorize("companyuser", "admin"), async (req,res) => {
    try {
        const company = await Company.findById(req.params.companyid)
        if(!company){
            return res.status(400).json({
                success: false,
                data: `Company with ${req.params.companyid} not found`
            })
        }

        if(company.user.toString() !== req.user.id){
            return res.status(400).json({
                success: false,
                data: `User ${req.user.id} is not authorized to update this company`
            })
        }

        if(company._id.toString() !== req.params.companyid){
            return res.status(400).json({
                success: false,
                data: `Job with ${req.params.id} does not exists for Company with ${req.params.companyid}`
            })
        }

        if(company.c_isVerified === true){
            const job = await Job.findById(req.params.id)
            if(!job){
                return res.status(400).json({
                    success: false,
                    data: `Job with ${req.params.id} not found`
                })
            }

            await Job.findByIdAndDelete(req.params.id)

            res.status(200).json({
                success: true,
                data: {},
            })
        }else{
            res.status(200).json({
                success: true,
                data: "Company is not Verified yet... You can Post the job once your company is verified."
            })
        }
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
})

router.get('/:jobid/applied_users', protect, async (req,res) => {
    try {
        const users = await User.find({"applied.job": req.params.jobid})

        const job = await Job.findById(req.params.jobid)
        if(!job){
            return res.status(400).json({
                success: false,
                data: `Job with ${req.params.id} not found`
            })
        }

        res.status(200).json({
            success: true,
            data: users
        })
    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
})

module.exports = router;