const request = require('request-promise'); 


let result;
async function storeData(sheetData, pdfData){
  const combinedData = {
    sheetData,
    pdfData
  }
  // console.log("combined Data: ");
  // console.log(combinedData);

  const options = { 
    method: 'POST', 

    // http:flaskserverurl:port/route 
    uri: 'http://127.0.0.1:5000/rag_response', 

    //The combinedData must be in object format because the python file will expect json style
    body: combinedData, 

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
          result = parsedBody.response; 
          console.log(result); 
      }) 
      .catch(function (err) { 
          console.log(err); 
      }); 
}

async function llmPrompt(questions, context){
  const llm_data = {
    questions,
    context
  }
  const options = { 
    method: 'POST', 

    // http:flaskserverurl:port/route 
    uri: 'http://127.0.0.1:5000/llm_response', 

    //The combinedData must be in object format because the python file will expect json style
    body: llm_data, 

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
          let result1 = parsedBody.response; 
          res.render('run_llm', {result: result1});
          // console.log(result); 
      }) 
      .catch(function (err) { 
          console.log(err); 
      });
}

module.exports = {storeData, llmPrompt, result};
