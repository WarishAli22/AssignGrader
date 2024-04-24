const express = require('express');
const router = express.Router()
const UploadedFile = require('../models/uploadedFile');
const parsepdf = require('pdf-parse');
const multer = require('multer');
const fs = require('fs').promises;

//Logged In Middleware
isLoggedIn = require("../login")

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname + '-' + uniqueSuffix)
      // cb(null, file.originalname)
    }
  })
  const upload = multer({ storage: storage })

  router.post('/', upload.array('pdfFiles'), isLoggedIn, (req,res)=>{ //isLoggedIn,//

    const files = req.files;
    console.log(files);
    console.log(req.user);
    
    // if(!req.files && !req.files.pdfFile){
    //   res.status(400);
    //   res.end();
    // }
  
    files.forEach((file)=>{
      parsepdf(file.path).then(result=>{
        // console.log(result)
        console.log(file.filename)
        console.log(req.user.id)
        console.log(result.text);
        const uploadedFile = new UploadedFile({
          filename: file.filename,
          fileText: result.text,
          userid: req.user.id,
        })
  
        uploadedFile.save().then(uploadedFile =>{
          console.log("Save Success");
        })
        .catch(e=>{
          console.log(e);
        })
      })
      .catch(err=>{
        console.log(err);
      })
    })
  })





module.exports = router;