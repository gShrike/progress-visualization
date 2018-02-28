const ChartjsNode = require('chartjs-node')
const moment = require('moment')

const assessments = require('./assessments.json')
const getStudentProgression = require('./src/student-progression')
const getAssessmentCompletionTime = require('./src/assessment-completion.js')
const getAssessmentAttempts = require('./src/assessment-attempts.js')

const destination = 'images'

function generate(studentProgress) {
  const groupedStudentProgress = groupByStudent(studentProgress, assessments)
  const progressData = getStudentProgression(groupedStudentProgress, assessments, false)
  const sortedProgressData = getStudentProgression(groupedStudentProgress, assessments, true)
  const assessmentCompletionData = getAssessmentCompletionTime(groupedStudentProgress, assessments)
  const assessmentAttemptsData = getAssessmentAttempts(studentProgress, assessments)
  generateChart('assessment-progression',
    {
      data: progressData,
      type: 'line',
      title: 'Student Progress of Passing Submission'
    })
  generateChart('sorted-assessment-progression',
    {
      data: sortedProgressData,
      type: 'line',
      title:  'Student Progress of Passing Submission'
    })
  generateChart('assessment-completion-time',
    {
      data: assessmentCompletionData,
      type: 'bar',
      title: 'Assessment Averaged Completion Time'
    })
  generateChart('assessment-attempts',
    {
      data: assessmentAttemptsData,
      type: 'bar',
      title: 'Assessment Failed Attempts'
    })
}

function generateChart(name, options) {
  if (global.CanvasGradient === undefined) {
    global.CanvasGradient = function() {};
  }
  const chartNode = new ChartjsNode(4000, 2000);
  chartNode.drawChart({
      data: options.data, 
      type: options.type,
      options: {
        title: {
          display: true,
          text: options.title
        },
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: false
            }
          }]
        }
      }
    })
    .then(() => {
      return chartNode.getImageBuffer('image/png');
    })
    .then(buffer => {
      return chartNode.getImageStream('image/png');
    })
    .then(streamResult => {
      streamResult.stream
      streamResult.length
      return chartNode.writeImageToFile('image/png', `./${destination}/${name}.png`);
    })
    .then(() => {
      console.log(`${name} chart created`)
    });
}

function groupByStudent(progress, assessments) {
  return progress.reduce((group, submission) => {
    const date = submission[0]
    const student = submission[2]
    const assessment = submission[3]
    const assessmentVersion = submission[11]
    const assessmentIndex = assessments.indexOf(`${assessment} - ${assessmentVersion}`)
    const passing = submission[9]

    group[student] = group[student] || { data: new Array(assessments.length), label: student, fill: false}

    if (passing === 'TRUE' && !group[student].data[assessmentIndex]) {
      group[student].data[assessmentIndex] = date ? moment(date.split(' ')[0]) : 0
    }

    return group
  }, {})
}

module.exports = {
  generate
}
