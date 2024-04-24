let request = new Array();
let questions = ["How are you?", "How is life?", "How is school?"];


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

const addReq = {
  requests: request
}

console.log(addReq.requests)