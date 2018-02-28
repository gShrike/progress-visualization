const fs = require('fs')
const csv = require('fast-csv')

const stream = fs.createReadStream("./progress.csv")

const graphs = require('./graphs')

const studentProgress = []

const csvStream = csv
  .parse()
  .on("data", handleData)
  .on("end", endParsing);

stream.pipe(csvStream);

function handleData(data){
  studentProgress.push(data)
}

function endParsing(){
  graphs.generate(studentProgress)
}
