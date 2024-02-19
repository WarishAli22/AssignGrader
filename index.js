const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const Instructor  = require('./models/instructor');

mongoose.connect('mongodb://localhost:27017/AssignGrader-Instructors')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
  console.log("Database Connected");
})



let projectName = "AssignGrader";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


//Getters
app.get('/', (req,res)=> {
  res.render('home')
})


/*app.get('/makecampground', async(req,res)=> {
  const camp = new Instructor({name: "Mir Warish", email:"warishrobab@gmail.com", password: "12548"})
  await camp.save();
  res.send(camp);
})*/







app.listen(3000, ()=>{
  console.log("Serving on Port 3000")
})
  
