const express = require('express');
const marksheetRouter = express.Router()
const app = express();
const {google} = require('googleapis');
const { initializeGoogleClients, forms, sheets } = require('../initializeGoogleClients');
const {getFormData} = require("../quesFormGenerate");
const {createMarkSheet} = require("../quesFormGenerate");

app.use(express.urlencoded({extended:true}));



marksheetRouter.post("/", async (req,res)=>{
  const {forms, sheets, oAuth2Client} = initializeGoogleClients(req)
  // createMarkSheet(sheets, oAuth2Client);
  // console.log(req);
  const{formID} = req.body;
  console.log("form id: ")
  console.log(formID)
  
  let ques_ans_array = await getFormData(formID, forms);
  console.log(ques_ans_array)

  if(ques_ans_array){
    const actualArray = ques_ans_array.flatMap(obj => {
      const objValues = Object.values(obj);
      return objValues.flat();
    });
    const marksheet_url = await createMarkSheet(sheets, oAuth2Client, actualArray);
  res.send(marksheet_url);
  }
  else{
    res.send("No responses yet")
  }
})














module.exports = {marksheetRouter};