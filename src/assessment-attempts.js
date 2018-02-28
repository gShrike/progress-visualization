const getRandomColor = require('../lib/random-color')

function getAssessmentAttempts(progress, assessments) {
  const groupedAssessments = progress.reduce((attempts, submission) => {
    const assessment = submission[3]
    const assessmentVersion = submission[11]
    const assessmentIndex = assessments.indexOf(`${assessment} - ${assessmentVersion}`)
    const passing = submission[9]

    if (passing === 'FALSE') {
      attempts[assessmentIndex] = attempts[assessmentIndex] === undefined ? 1 : attempts[assessmentIndex] + 1
    }

    return attempts
  }, [])
  return formatData(groupedAssessments, assessments)
}

function formatData(submissions, assessments) {
  const filteredSubmissions = submissions.filter((submission, index) => {
    if (!submission) {
      assessments.splice(index, 1)
    }
    return submission
  })
  return {
    labels: assessments,
    datasets: [
      {
        label: "Assessment Attempts",
        backgroundColor: assessments.map(getRandomColor),
        data: filteredSubmissions
      }
    ]
  }
}

module.exports = getAssessmentAttempts
