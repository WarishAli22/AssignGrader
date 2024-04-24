const express = require('express');
const router = express.Router()
const request = require('request-promise'); 

//Logged In Middleware
isLoggedIn = require("../login")

router.get('/', isLoggedIn, async (req,res)=>{
  const prompt = {
    'p' : `{
      ""
      Write a poem about love. Make sure it's only 8 lines
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
          result = parsedBody.response; 
          res.render('run_llm', {result: result});
          // console.log(result); 
      }) 
      .catch(function (err) { 
          console.log(err); 
      }); 
})

module.exports = router