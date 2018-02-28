const getRandomColor = require('../lib/random-color')

function getAssessmentCompletionTime(progress, assessments) {
  const groupedAssessmentsWithDate = groupAssessmentsWithDate(progress, assessments)
  const assessmentsWithTime = addAssessmentSubmissionTime(groupedAssessmentsWithDate)
  const averagedAssessmentsSubmissionTime = averageAssessments(assessmentsWithTime, assessments)
  return formatData(averagedAssessmentsSubmissionTime)
}

function groupAssessmentsWithDate(progress, assessments) {
  return Object.keys(progress).map(student => {
    return progress[student].data
      .reduce((submissions, submission, index) => {
        if (submission) {
          submissions.push({
            date: submission,
            name: assessments[index]
          })
        }
        return submissions
      }, [])
      .sort((a, b) => {
        const diff = a.date.diff(b.date)
        if (diff > 0) {
          return 1
        } else if (diff === 0) {
          return 0
        } else {
          return -1
        }
      })
  })
}

function addAssessmentSubmissionTime(groupedAssessments) {
  return groupedAssessments.map(assessments => {
    return assessments.map((assessment, index) => {
      if (index === 0) {
        assessment.time = 0
      } else {
        assessment.time = assessment.date.diff(assessments[index-1].date, 'days')
      }
      return assessment
    })
  })
}

function averageAssessments(groupedAssessments, assessmentList) {
  const assessmentTotals = groupedAssessments
    .reduce((assessmentIndex, assessments) => {
      assessments.forEach(assessment => {
        assessmentIndex[assessment.name] = assessmentIndex[assessment.name] || { total: 0, count: 0 }
        assessmentIndex[assessment.name].total += assessment.time
        assessmentIndex[assessment.name].count++
      })
      return assessmentIndex
    }, {})
  const orderedAssessments = []
  Object.keys(assessmentTotals)
    .forEach(assessment => {
      const index = assessmentList.indexOf(assessment)
      orderedAssessments[index] = {
        label: assessment,
        data: assessmentTotals[assessment].total / assessmentTotals[assessment].count
      }
    })
  return orderedAssessments
    .filter(assessment => assessment.data)
    .filter(assessment => assessment.data < 10)
}

function formatData(assessments) {
  return {
    labels: assessments.map(assessment => assessment.label),
    datasets: [
      {
        label: "Average Days Since Last Submission",
        backgroundColor: assessments.map(getRandomColor),
        data: assessments.map(assessment => assessment.data)
      }
    ]
  }
}

module.exports = getAssessmentCompletionTime
