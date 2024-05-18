const express = require('express');
const marksheetRouter = express.Router()
const app = express();
const {google} = require('googleapis');
const { initializeGoogleClients, forms, sheets } = require('../initializeGoogleClients');
const {getFormData} = require("../quesFormGenerate");

app.use(express.urlencoded({extended:true}));

async function createMarkSheet(sheets, oAuth2Client){
  const marksheet = await sheets.spreadsheets.create({
    auth: oAuth2Client,
    requestBody : {
      "properties" : {
        "title" : "marksheet",
      }
    }
  })

  const url = marksheet.data.spreadsheetUrl;
  console.log(url)
}

marksheetRouter.get("/", (req,res)=>{
  const {forms, sheets, oAuth2Client} = initializeGoogleClients(req);
  // createMarkSheet(sheets, oAuth2Client);
  // console.log(req);
  const{formID} = req.query;
  console.log("form id: ")
  console.log(formID)
  
  let ques_ans_array = getFormData(formID, forms);
})














module.exports = {marksheetRouter};