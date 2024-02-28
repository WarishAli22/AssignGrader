const instructor  = require('../models/instructor');

  function validEmail(email){

    if(email.match((/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/))){
      return true;
    }
    return false;
  }

  async function emailExists(email){
    let insObj = await instructor.find({email: email});
    // console.log("obj length: " + insObj.length);
    if(insObj.length > 0){
      return true;
    }
    return false;
  }

  function validPass(password){
    if(password.length < 8){
      return false;
    }
    return true;
  }

  module.exports = {validPass, emailExists, validEmail};

