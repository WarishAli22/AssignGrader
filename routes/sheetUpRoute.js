const express = require('express');
const router = express.Router()
const app = express();
const {google} = require('googleapis');
const {storeData} = require("../storage");
const {llmPrompt} = require("../storage");
const {result} = require("../storage");
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
  console.log(response.data);
  console.log('Form created successfully!');

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

let sheetStore = {};

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
    console.log(sheetTitle);

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


    // const questions = unfilt_questions.data.values.filter(subArray => subArray.length > 0);
    let questionArray = [];
    let q;
    for(let i=0; i<unfilt_questions.data.values.length; i++){
      if(unfilt_questions.data.values[i][0] != null){
        q = unfilt_questions.data.values[i][0].replace(/(\r\n|\n|\r)/gm, " ");
      }
      else{
        q = unfilt_questions.data.values[i][0]
      }
      
      questionArray.push(q);
    }

    console.log("questionArray: ");
    console.log(questionArray[0]);

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
    console.log(marksArray);



    let rubricArr = []
    
    
    let j = 0;
    for(let i=0; i<questionArray.length; i+=7){
      let rubricObj = {}
      if(questionArray[i] != null){
        rubricObj["question"] = questionArray[j];
        while(j<i+7){
          rubricObj[`${levelsArray[j]}`] = {
            "criteria" : criteriaArray[j],
            "mark" : marksArray[j]
          }
          j++
        }
        rubricArr.push(rubricObj)
      }
    }
    console.log("rubricArr: ")
    console.log(rubricArr)

    sheetStore["questions"] = questionArray;
    llmPrompt(rubricArr, result)
    storeData(sheetStore, pdfDataArray);


    // console.log(sheetStore)

  
    //Generates Form by taking in questions array and form auth object as param
    const formID = await generateForm(questionArray, forms);
    console.log(formID);

    // TODO Process rows and store data in your database

  } catch (error) {
    console.error('Error fetching data:', error);
    // res.status(500).json({ success: false, message: 'Failed to fetch data from Google Sheets.' });
  }

})

module.exports = {router, sheetStore};