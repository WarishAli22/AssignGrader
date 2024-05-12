


    let k=0;
    let questIndex = []
    while(k < questionArray.length){
      if(questionArray[k] === "empty_cell"){
        k++;
        
      }
      else{
        questIndex.push(k);
        k++;
      }
      
    }
    console.log(questIndex)

    let j;
    questionArray.forEach((question, idx) => {
      console.log(idx)
      if(question !== "empty_cell"){
        let rubricObj = {};
        console.log("Question: " + question)
        rubricObj["question"] = question;
        j = idx;
        rubricObj[`${levelsArray[j]}`] = {
          "criteria" : criteriaArray[j],
          "mark" : marksArray[j]
        }
        console.log("idx: " + j)
        j++;
        while(levelsArray[j] !== "level_1"){
          console.log(`While loop runs ${j} times`);
          console.log(levelsArray[j]);
          console.log(criteriaArray[j]);
          console.log(marksArray[j]);

          rubricObj[`${levelsArray[j]}`] = {
            "criteria" : criteriaArray[j],
            "mark" : marksArray[j]
          }
          j++
        }
        rubricArr.push(rubricObj);
        console.log(rubricArr)
      }
    })
    console.log("rubricArr: ")
    console.log(rubricArr)





// let request = new Array();
// let questions = ["How are you?", "How is life?", "How is school?"];


// questions.forEach((question, index) => {
//   request.push(
//     {
//       createItem: {
//         item: {
//           title: question,
//           questionItem: {
//             question: {
//               textQuestion: {}
//             }
//           }
//         },
//         location: {
//           index: index,
//         },
//       },
//     }
//   )
// })

// const addReq = {
//   requests: request
// }

// console.log(addReq.requests)

let arr = ["Level 0", "Level 1", "Level 2", "Level 0", "Level 1"]

let j = arr.indexOf("Level 0", 0)
console.log(j)

let key = "hoya"

let obj = {}

obj[`${key}`] = "yeeee"

console.log(obj)