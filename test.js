let ques_ans_arr = [
  {
    question: 'Study Sources A and B. How far do these two sources agree? Explain your answer using details of the sources.',
    answer0: 's',
    answer1: 'a'
  },
  {
    question: 'Study Sources D and E. How far does Source E make Source D surprising? Explain your answer using details of the sources and your knowledge.',
    answer1: 'aa'
  },
  {
    question: 'Study Source F. Why did Heydebrand make this speech at that time? Explain your answer using details of the source and your knowledge.',
    answer0: 'sss',
    answer1: 'aaa'
  },
  {
    question: 'Study Source G. Do you trust this account of the crisis over Morocco? Explain your answer using details of the source and your knowledge.',
    answer0: 'ssss',
    answer1: 'aaaa',
    answer3: 'aaaa'
  }
]



const actualArray = ques_ans_arr.flatMap(obj => {
  const objValues = Object.values(obj);
  return objValues.flat();
});
console.log(actualArray)