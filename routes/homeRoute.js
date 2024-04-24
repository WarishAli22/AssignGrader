const express = require('express');
const router = express.Router()

//Logged In Middleware
isLoggedIn = require("../login")

router.get('/', isLoggedIn, (req,res)=>{
  console.log(req.user);
  res.render("home");
})

module.exports = router;