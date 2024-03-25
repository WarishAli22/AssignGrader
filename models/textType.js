const { result } = require('./index.js')

    const div = document.querySelector(".AnswerText");
    const text = result;
    console.log(text);

    function textType(element, text, i=0){
      element.textContent += text[i];

      if(i === text.length - 1){
        return;
      }
      setTimeout(()=> textType(element, text, i+1), 50);
    }

    textType(div, text);