const express = require('express');
const router = express.Router()
const app = express();
const {google} = require('googleapis');
const {getContext} = require("../bundleData");
const {llmPrompt} = require("../bundleData");
const {result} = require("../bundleData");
const {pdfDataArray} = require("../routes/pdfUpRoute");


function sheetIdExtract(link){
  let extract = link.match(/\/d\/(.+)\//);
  let id = extract[1];
  return id;
}

async function generateForm(questions, forms){
  //Basic Form Info
  const newForm = {
    info: {
      title: 'Question Form',
    },
  };

  //Creating Form
  const response = await forms.forms.create({
    requestBody: newForm,
  });
  // console.log(response.data);
  // console.log('Form created successfully!');

  const updateReq = {
    requests: [
      {
        updateFormInfo: {
          info: {
            description:
              'Please complete this quiz',
          },
          updateMask: 'description',
        },
      },
    ],
  }

  const updateResponse = await forms.forms.batchUpdate({
    formId: response.data.formId,
    requestBody: updateReq,
  });
  console.log('Form Updated successfully!');

  let request = new Array();

  questions.forEach((question, index) => {
    request.push(
      {
        createItem: {
          item: {
            title: question,
            questionItem: {
              question: {
                textQuestion: {}
              }
            }
          },
          location: {
            index: index,
          },
        },
      }
    )
  })

  //Making The Request Body to send to the form
  const addReq = {
    requests: request
  }

  const addResponse = await forms.forms.batchUpdate({
    formId: response.data.formId,
    requestBody: addReq,
  });
  console.log('Form Item Added successfully!');

  return response.data.formId;
}

let rubricArr = []

router.post('/', async(req,res)=>{

  const {sheetLink} = req.body;
  const sheetID = sheetIdExtract(sheetLink);
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials(req.user.tokens);
  const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  const sheets = google.sheets({ version: 'v4' , auth: oAuth2Client});
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

    console.log("questionArray: ");
    console.log(questionArray);

    const criterias = criteria.data.values;
    let criteriaArray = [];
    for(let i=0; i<criterias.length; i++){
      let q = criterias[i][0].replace(/(\r\n|\n|\r)/gm, " ");
      criteriaArray.push(q);
    }

    console.log("criteriaArray: ");
    console.log(criteriaArray);

    const level = levels.data.values;
    let levelsArray = [];
    for(let i=0; i<level.length; i++){
      let l = level[i][0].toLowerCase();
      levelsArray.push(l);
    }
    console.log("levelsArray");
    console.log(levelsArray);

    const mark = marks.data.values;
    let marksArray = [];
    for(let i=0; i<mark.length; i++){
      let m = mark[i][0];
      marksArray.push(m);
    }
    console.log("marksArray");
    console.log(marksArray.length);

    console.log("levelsArray");
    console.log(levelsArray.length);

    console.log("criteriaArray");
    console.log(criteriaArray.length);

    console.log("questionArray");
    console.log(questionArray.length);

    let length = levelsArray.length
    console.log(questionArray);

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

    let rubricArr = [];
    questionArray.forEach((question, idx) =>{
      console.log("idx: " + idx);
      let rubricObj = {};
      rubricObj["question"] = question;
      let i = indexArray[idx];
      let j = indexArray[idx+1];
      for(let k = i; k<j; k++){
        rubricObj["levels"] = [].push({
          "level" : `${levelsArray[k]}`,
          "criteria" : criteriaArray[k],
          "mark" : marksArray[k]
        })
      }
      rubricArr.push(rubricObj);
    })

    console.log(rubricArr)



   











































    // let context = await getContext(rubricArr, pdfDataArray);
    // console.log("Context: " + context);

  
    //Generates Form by taking in questions array and form auth object as param
    // const formID = await generateForm(questionArray, forms);
    // console.log(formID);

    // TODO Process rows and store data in your database

  } catch (error) {
    console.error('Error fetching data:', error);
    // res.status(500).json({ success: false, message: 'Failed to fetch data from Google Sheets.' });
  }

})

module.exports = {router, rubricArr};