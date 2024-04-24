const express = require('express');

//Logged In Middleware
function isLoggedIn(req,res,next){
  req.user ? next() : res.redirect("/");
}

module.exports = isLoggedIn;