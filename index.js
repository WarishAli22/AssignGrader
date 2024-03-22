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

const request = require('request-promise'); 
const parsepdf = require('pdf-parse');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



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



//GET REQS
app.get('/', (req,res)=>{
  res.render("login");
})

app.get('/assess', (req,res)=>{
  res.render('assessment')
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

//When we send a request to this path, everything inside is executed
app.get('/llm', async (req,res)=>{
  const prompt = {
    'p' : `{
      ""
      Write exactly 8 lines of a romance themed poem
      ""
      }`
  }

  const options = { 
    method: 'POST', 

    // http:flaskserverurl:port/route 
    uri: 'http://127.0.0.1:5000/llm_response', 

    //The prompt must be in object format because the python file will expect json style
    body: prompt, 

    // Automatically stringifies 
    // the body to JSON  
    json: true
}; 

var sendrequest = await request(options) 
  
        // The parsedBody contains the data 
        // sent back from the Flask server  
        .then(function (parsedBody) { 
            console.log("parsedBody: " + parsedBody); 
              
            // You can do something with 
            // returned data 
            let result; 
            result = parsedBody['response']; 
            console.log(result); 
        }) 
        .catch(function (err) { 
            console.log(err); 
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

//POST REQS
app.post('/pdfparse', upload.array('pdfFiles'), (req,res)=>{

  const files = req.files;
  console.log(files[0]);
  // if(!req.files && !req.files.pdfFile){
  //   res.status(400);
  //   res.end();
  // }

  parsepdf(files[0].path).then(result=>{
    console.log(result.text);
  })
})


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
  