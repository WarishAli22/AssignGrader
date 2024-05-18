const express = require('express');
const router = express.Router()
const app = express();
const {google} = require('googleapis');

const getFormsAndFormID = async (req, questionArray) => {
  const { rubricSheetLink } = req.body;
  const { studentSheetLink } = req.body;
  const sheetID = sheetIdExtract(rubricSheetLink);
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials(req.user.tokens);
  const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

  try {
    // ... (existing code for fetching data from Google Sheets)

    const formID = await generateForm(questionArray, forms);

    return { forms, formID };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

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

  let index = 0;
  questions.forEach((question) => {
    request.push(
      {
        createItem: {
          item: {
            title: question,
            questionItem: {
              question: {
                textQuestion: {"paragraph" : true}
              }
            }
          },
          location: {
            index: index,
          },
        },
      }
    )
    index++;
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




async function getFormData(formID, forms){
  let ques_ans_arr = [];
  let answersArr;
  let ques_id;
  const formResponse = await forms.forms.get({ formId: formID });
  const ans_res = await forms.forms.responses.list({formId: formID});
  const formQuestions = formResponse.data.items;
  responseArr = ans_res.data.responses;
  let ques_id_array = [];

  if(responseArr){
    responseArr.forEach((answer)=>{
      answersArr = Object.values(answer.answers)
      ques_id_obj = {};
      answersArr.forEach((ans)=>{
        ques_id_obj[`${ans.questionId}`] = ans.textAnswers.answers[0]["value"]
        // console.log(ans.textAnswers.answers[0]["value"] + "   " + ans.questionId);
      })
      ques_id_array.push(ques_id_obj);
    });

    // console.log(ques_id_array)

    for(const quest of formQuestions){
      let ques_ans_obj = {};
      ques_id = quest.questionItem["question"].questionId;
      ques_ans_obj["question"] = quest.title;
      ques_id_array.forEach((ques, idx)=>{
        ques_ans_obj[`answer${idx}`] = ques[ques_id];
      })
      ques_ans_arr.push(ques_ans_obj)
    }
    
    // console.log(res.data);
    console.log(ques_ans_arr);
    return ques_ans_arr;
  }
  else{
    console.log("no responses yet")
  }
  
}




module.exports = {generateForm, getFormData, getFormsAndFormID}


// for(let i=0; i<answersArr.length; i++){
//   if(ques_id == answersArr[i].questionId && answersArr[i].textAnswers.answers[0]["value"] != null){
//     ques_ans_obj[`answer${i}`] = `${answersArr[i].textAnswers.answers[0]["value"]}` 
//   }
//}