const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const process = require('process');
const passport = require('passport');
const session = require("express-session");
const auth = require('./auth');
const fs = require('fs').promises;


app.use(session({secret:process.env.secret}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended:true}));

const homeRoute = require("./routes/homeRoute")
const llmRoute = require("./routes/llmRoute")
const sheetUpRoute = require("./routes/sheetUpRoute")
const pdfUpRoute = require("./routes/pdfUpRoute")

app.use('/home', homeRoute )
app.use('/llm', llmRoute )
app.use('/sheetUpload', sheetUpRoute)
app.use('/pdfparse', pdfUpRoute)



//Database Connections Checking using promises
mongoose.connect(process.env.mongodbserver)
.then(()=>{
  console.log("Database Connected");
})
.catch(err =>{
  console.log("Error connecting to DB");
  console.log(err.toString());
})


//AUTH GET REQS
app.get('/', (req,res)=>{
  res.render("login");
})

app.get('/auth/google',
  passport.authenticate('google', {scope: ['email', 'profile', 'https://www.googleapis.com/auth/spreadsheets.readonly' , 'https://www.googleapis.com/auth/forms.body']})
)

app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/auth/failure',
  }),
  );

app.get('/auth/failure', (req,res)=>{
  res.render("authFail");
})

app.get('/logout', (req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})


app.listen(4000, ()=>{
  console.log("Serving on Port 4000")
})
  