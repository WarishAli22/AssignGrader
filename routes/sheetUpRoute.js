const express = require('express');
const router = express.Router()
const app = express();
const path = require('path');
const {google} = require('googleapis');
const {getContext} = require("../bundleData");
const {llmPrompt} = require("../bundleData");
const {result} = require("../bundleData");
const {pdfDataArray} = require("../routes/pdfUpRoute");
const {generateForm} = require("../quesFormGenerate");
const {getFormData} = require("../quesFormGenerate");
const {getFormsAndFormID} = require("../quesFormGenerate");
const { initializeGoogleClients, forms, sheets } = require('../initializeGoogleClients');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))



function sheetIdExtract(link){
  let extract = link.match(/\/d\/(.+)\//);
  let id = extract[1];
  return id;
}




let rubricArr = [];


router.post('/', async(req,res)=>{
  
  const {rubricSheetLink} = req.body;
  const {studentSheetLink} = req.body;
  
  const sheetID = sheetIdExtract(rubricSheetLink);
  // const oAuth2Client = new google.auth.OAuth2();
  // oAuth2Client.setCredentials(req.user.tokens);
  const {forms, sheets, oAuth2Client} = initializeGoogleClients(req)
  // const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  // const sheets = google.sheets({ version: 'v4' , auth: oAuth2Client});
  try {
    const metadata = await sheets.spreadsheets.get({
      auth: oAuth2Client,
      spreadsheetId: sheetID,
    })

    //Gets Title of First Sheet Page
    const sheetTitle = metadata.data.sheets[0].properties.title;
    // console.log(sheetTitle);

    //READ QUESTION ROW FROM SPREADHSEET
    const unfilt_questions = await sheets.spreadsheets.values.get({
      auth: oAuth2Client,
      spreadsheetId: sheetID,
      range: `${sheetTitle}!A2:A`,
    })

    const levels = await sheets.spreadsheets.values.get({
      auth: oAuth2Client,
      spreadsheetId: sheetID,
      range: `${sheetTitle}!B2:B`,
    }) 

    const criteria = await sheets.spreadsheets.values.get({
      auth: oAuth2Client,
      spreadsheetId: sheetID,
      range: `${sheetTitle}!C2:C`,
    }) 

    const marks = await sheets.spreadsheets.values.get({
      auth: oAuth2Client,
      spreadsheetId: sheetID,
      range: `${sheetTitle}!D2:D`,
    }) 


    const questions = unfilt_questions.data.values.filter(subArray => subArray.length > 0);
    let questionArray = [];
    let q;
    for(let i=0; i<questions.length; i++){
      q = questions[i][0].replace(/(\r\n|\n|\r)/gm, " ");
      questionArray.push(q);
    }

    const criterias = criteria.data.values;
    let criteriaArray = [];
    for(let i=0; i<criterias.length; i++){
      let q = criterias[i][0].replace(/(\r\n|\n|\r)/gm, " ");
      criteriaArray.push(q);
    }


    const level = levels.data.values;
    let levelsArray = [];
    for(let i=0; i<level.length; i++){
      let l = level[i][0].toLowerCase();
      levelsArray.push(l);
    }


    const mark = marks.data.values;
    let marksArray = [];
    for(let i=0; i<mark.length; i++){
      let m = mark[i][0];
      marksArray.push(m);
    }

    let length = levelsArray.length

    let indexArray = [];
    for(let k=0; k<length; k++){
      if(levelsArray[k] === "level 1"){
        indexArray.push(k)
      }
      if(k == length-1){
        indexArray.push(k+1)
      }
    }
    console.log(indexArray);

      

  // let idx = 0;
  // for(const question of questionArray) {
  //     let rubricObj = {};
  //     rubricObj["question"] = question;
  //     let context = await getContext(question, pdfDataArray)
  //       rubricObj["context"] = context;
  //       let i = indexArray[idx];
  //       let j = indexArray[idx+1];
  //       for(let k = i; k<j; k++){
  //           rubricObj[`${levelsArray[k]}`] = {
  //               "level" : `${levelsArray[k]}`,
  //               "criteria" : criteriaArray[k],
  //               "mark" : marksArray[k]
  //           }
  //       }
  //       idx++
  //       rubricArr.push(rubricObj);
// };

      // console.log(rubricArr);


    //Generates Form by taking in questions array and form auth object as param
    const formID = await generateForm(questionArray, forms);
    const formLink = `https://docs.google.com/forms/d/${formID}/edit`
    console.log(formLink);

    // getFormData(forms, formID)
    
    

    // TODO Process rows and store data in your database


    res.render('genmarkSheet', { "formID": formID });
  } catch (error) {
    console.error('Error fetching data:', error);
    // res.status(500).json({ success: false, message: 'Failed to fetch data from Google Sheets.' });
  }
  
})


module.exports = {router, rubricArr};

