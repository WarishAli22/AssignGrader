const express = require('express');
const markviewRouter = express.Router()

//Logged In Middleware
isLoggedIn = require("../login")

markviewRouter.get('/', isLoggedIn, (req,res)=>{
  // console.log(req.user);
  res.render("genmarkSheet");
})

module.exports = {markviewRouter};
