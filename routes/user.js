const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authAdmin");
const path = require("path");
const Job = require("../models/Job");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).populate("ques_response.question");
    if (users) {
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({ 
      path: 'applied',
      option: {strictPopulate: false} ,
      populate: {
        path: 'job',
        model: 'Job'
      },
     
   })

    if (user) {
     return res.status(200).json({
        success: true,
        data: user,
      });
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, role , disability } = req.body;

    // const user = await User.findOne({email})
    // console.log(user)
    // if(user == email){
    //     return res.status(400).json({
    //         success: false,
    //         data: "User Already exists"
    //     })
    // }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.findOne({ email });
    console.log(user);

    if (user?.email == email) {
      return res.status(400).json({
        success: false,
        data: { err: "User Already exists" },
      });
    }

    const newUser = new User({
      name,
      email,
      role,
      disability,
      password: hashedPassword,
    });

    await newUser.save();

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid Credentials",
      });
    }



    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        error: "Invalid Credentials",
      });
    } else {
      return sendTokenResponse(user, 200, res);
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});

router.put("/logout", protect, async (req, res) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.ENVIRONMENT === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

router.put("/:id/photo", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        data: `User not found`,
      });
    }

    if (req.params.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        data: `User with ${req.params.id} is not authorized to update the user`,
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        data: `No file uploaded`,
      });
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        success: false,
        data: `File must be an image`,
      });
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return res.status(400).json({
        success: false,
        data: `File is too large. Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
      });
    }

    file.name = `photo_${user._id}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/users/${file.name}`,
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: "Problem with file upload",
          });
        }
      }
    );
    const profileUrl = `http://localhost:${process.env.PORT || 3000}${
      path.sep
    }uploads${path.sep}users${path.sep}${file.name}`;

    User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          photo: profileUrl,
        },
      },
      (err, user) => {
        if(err){
            return res.status(500).json({ success:false , err: err.message });  
        }else{
            return res.status(200).json({ success:true , user: user});
        }
      }
    );
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.put("/:id/certificate", protect, async (req, res) => {
  console.log(req.params.id, req.user);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: `User not found`,
      });
    }

    if (req.params.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        data: `User with ${req.params.id} is not authorized to update the user`,
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        data: `No file uploaded`,
      });
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith("application")) {
      return res.status(400).json({
        success: false,
        data: `File must be a document`,
      });
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return res.status(400).json({
        success: false,
        data: `File is too large. Please upload a document less than ${process.env.MAX_FILE_UPLOAD}`,
      });
    }

    file.name = `certificate${user._id}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/users/${file.name}`,
      async (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            data: "Problem with file upload",
          });
        }
      }
    );
    const certificateUrl = `http://localhost:${process.env.PORT || 3000}${
      path.sep
    }uploads${path.sep}users${path.sep}${file.name}`;

    const userDetails = await User.findByIdAndUpdate(req.params.id, {
      certificate: certificateUrl,
    });

    if (userDetails) {
      console.log(userDetails);
      return res.status(200).json({
        success: true,
        data: "uploaded certificate successfully !!",
      });
    }
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.put("/:id/apply/:jobid", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobid);
    if (!job) {
      return res.status(400).json({
        success: false,
        data: `Job with ${req.params.jobid} not found`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: `User with ${req.params.id} not found`,
      });
    }

    if (req.params.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        error: `User with ${req.user.id} is not authorize to update the user`,
      });
    }



    if(user.isVerified === true){

       const applied =await Job.findOne({_id:req.params.jobid ,  j_applied : { $elemMatch: { user: req.params.id } } })
       console.log(applied,"applied already bitch")   
       if(!applied){
        await Job.findByIdAndUpdate(
          req.params.jobid,
          {
            $push: {
              j_applied: {
                user: req.params.id,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
  
        const newUser = await User.findByIdAndUpdate(
          req.params.id,
          {
            $push: {
              applied: {
                  job: req.params.jobid,
              },  
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
  
       return res.status(200).json({
          success: true,
          data: newUser,
        });
       }
  
       return res.status(400).json({
        success: false,
        error: `User Has Already Applied For This Job`,
      });
      
    }else{
     return res.status(400).json({
        success: false,
        error: "User is not Verified yet... You can apply to the job once you're verified."
    })
    }
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.put('/:compid/applied', protect, authorize("companyuser"), async (req,res) => {
  try {
    
  } catch (err) {
    return res.status(500).json({err: err.message})
  }
}) 


router.put('/:id/:ques_id/answers_response', protect, async (req, res) => {
  try {
  
    const user = await User.findById(req.params.id);


  } catch (err) {
      return res.status(500).json({err: err.message})
  }
})


module.exports = router;
