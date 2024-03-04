const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const process = require('process');
const passport = require('passport');
const session = require("express-session");
const auth = require('./auth');
const fs = require('fs').promises;
const {google} = require('googleapis');



function isLoggedIn(req,res,next){
  req.user ? next() : res.redirect("/");
}

app.use(session({secret:process.env.secret}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended:true}));

//Database Connections Checking using promises
mongoose.connect('mongodb://localhost:27017/AssignGrader')
.then(()=>{
  console.log("Database Connected");
})
.catch(err =>{
  console.log("Error connecting to DB");
  console.log(err.toString());
})



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
  })
)

app.get('/auth/failure', (req,res)=>{
  res.render("authFail");
})

app.get('/logout', (req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})


//Protected
app.get('/home', isLoggedIn, (req,res)=>{
  // console.log(req.user);
  res.render("home");
})



function sheetIdExtract(link){
  let extract = link.match(/\/d\/(.+)\//);
  let id = extract[1];
  return id;
}



app.post('/sheetUpload', async(req,res)=>{

  const {sheetLink} = req.body;
  const sheetID = sheetIdExtract(sheetLink);
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials(req.user.tokens);
  const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  const sheets = google.sheets({ version: 'v4' , auth: oAuth2Client});
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetID,
      range: 'A:A', // adjust range as needed
    });
    const values = response.data.values;
    console.log(values);

    const extractedTexts = [];
    values.forEach(row => {
      row.forEach(cell => {
        if (cell.toLowerCase().includes('question')) {
          extractedTexts.push(cell);
        }
      });
    });

    const formTitle = 'Generated Form';
    const formQuestions = values.map(row => ({
      type: 'text',
      title: row[0], // Use first column data as question title
      helpText: 'Please provide your answer',
    }));

    // Create Google Form
    const formResponse = await forms.create({
      "info": {
        title: formTitle,
        questions: formQuestions,
      },
    });
    const formId = formResponse.data.formId;
    console.log(formId);
    console.log(extractedTexts);
    // Process rows and store data in your database
    res.status(200).json({ success: true, message: 'Data fetched and stored successfully!' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch data from Google Sheets.' });
  }

})






app.listen(4000, ()=>{
  console.log("Serving on Port 4000")
})
  