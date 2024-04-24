const express = require('express');
const router = express.Router()
const {google} = require('googleapis');


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

    // console.log(unfilt_questions.data.values);

    const questions = unfilt_questions.data.values.filter(subArray => subArray.length > 0);
    let questionArray = [];
    for(let i=0; i<questions.length; i++){
      let q = questions[i][0].replace(/(\r\n|\n|\r)/gm, "");
      questionArray.push(q);
    }
    console.log(questionArray);
    

    //Generates Form by taking in questions array and form auth object as param
    const formID = await generateForm(questionArray, forms);
    console.log(formID);

    // TODO Process rows and store data in your database

  } catch (error) {
    console.error('Error fetching data:', error);
    // res.status(500).json({ success: false, message: 'Failed to fetch data from Google Sheets.' });
  }

})

module.exports = router;