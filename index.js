const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const Instructor  = require('./models/instructor');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');



//Database Connections Checking using promises
mongoose.connect('mongodb://localhost:27017/AssignGrader')
.then(()=>{
  console.log("Database Connected");
})
.catch(err =>{
  console.log("Error connecting to DB");
  console.log(err.toString());
})

// const user = new Instructor({
//   name: "Alan",
//   email: "alanrickman@gmail.com", 
//   password:"1254"
// })

// user.save();

// const manyUser = Instructor.insertMany(
//   [

//     {
//       name: "Alan",
//       email: "alanrickman@gmail.com", 
//       password:"1254"
//     }, 

//     { 
//       name: "Arsan",
//       email: "aesrickman@gmail.com", 
//       password:"125455"
//     }, 
//   ]
// )

// // manyUser.save();




//Database Connections Checking using callbacks
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", ()=>{
//   console.log("Database Connected");
// })




let projectName = "AssignGrader";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}));
app.use(cookieParser("NotaGoodSecret"));
app.use(session({
  secret:"NotaGoodSecret", resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 60000 } /*secure will be set to true once we serve over HTTPS and not HTTP */
}));
app.use(flash());


//Gets
app.get('/', (req,res)=> {
  res.render('home')
})

app.get('/register', (req,res)=>{
  res.render('register', {messages: req.flash('error')})
})

//Posts
app.post('/register', async (req,res)=>{
  const {email, username, password} = req.body;
  console.log(username);
  if(email.match((/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/))){
    const hashPass = await bcrypt.hash(password, 12);
    const user = new Instructor({
      name: username,
      email : email,
      password : hashPass
  })
  await user.save();
  }
  else{
    req.flash('error', "Please Enter a valid email");
    res.redirect('/register');
  }
})

// app.get('/instructors', async(req,res)=>{
//   const inst = await Instructor.find({});
//   console.log(inst);
//   res.send("Instructors");
// })


/*app.get('/makecampground', async(req,res)=> {
  const camp = new Instructor({name: "Mir Warish", email:"warishrobab@gmail.com", password: "12548"})
  await camp.save();
  res.send(camp);
})*/







app.listen(3000, ()=>{
  console.log("Serving on Port 3000")
})
  
