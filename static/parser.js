const DISPLAY_PERCENTAGE = 100
let progress_intervals = 5 

function parse({submissions, student, modifiedEndDate}) {
  progress_intervals = modifiedEndDate != 'FALSE' ? 2 : 5
  const totalIntervals = DISPLAY_PERCENTAGE/progress_intervals

  const progress = { students: {}, invalidRecords:[] }
  submissions.forEach(submission => {
    groupStudentCompletedAssessments(progress, submission)
  })
  groupStudentAssessmentIntoIntervals(progress.students, totalIntervals, student)
  aggregateStudentIntervals(progress.students, totalIntervals)
  let currentStudent = progress.students.currentStudent
  if (currentStudent) {
    currentStudent = currentStudent.progress.map(interval => interval.assessments.length)
    progress.students.currentStudent = currentStudent
  }

  return progress.students
}

function groupStudentCompletedAssessments(progress, submission) {
  let date = submission.date
  const name = submission.studentName
  const assessment = submission.standardDescription
  if (!name || !assessment || !date || !submission.startDate) {
    progress.invalidRecords.push(submission)
    return
  }
  date = new Date(date)
  const students = progress.students
  if (!students[name]) {
    const startDate = new Date(submission.startDate)
    const endDate = new Date(submission.endDate)
    students[name] = {startDate, endDate, assessments: {}}
  }
  const student = students[name]
  if (submission.didPass === 'TRUE' && !student.assessments[assessment]) {
    student.assessments[assessment] = date
  }
}

function groupStudentAssessmentIntoIntervals(students, totalIntervals, filterStudent) {
  for (let name in students) { 
    progressIntervals = []
    const student = students[name]
    if (filterStudent && name === filterStudent.fullName) {
      students.currentStudent = student
      student.endDate = new Date(filterStudent.endDate)
    }
    const millisecondsPerDay = (1000*60*60*24)
    millisecondIntervals = (student.endDate - student.startDate) / totalIntervals
    currentDate = student.startDate
    for (let i = 0; i < totalIntervals; i++) {
      currentDate = new Date(currentDate.getTime() + millisecondIntervals)
      if (currentDate >= new Date()) {
        break
      }
      progressIntervals.push({date: currentDate, assessments: []})
    }
    for (let assessment in student.assessments) {
      assessmentDate = student.assessments[assessment]
      progressIntervals = progressIntervals.map(interval => {
        if (assessmentDate <= interval.date) {
          interval.assessments.push(assessment)
        }
        return interval
      })
    }
    delete student.assessments
    student.progress = progressIntervals
  }
}

function aggregateStudentIntervals(students, totalIntervals) {
  const intervals = []
  for (let i = 0; i < totalIntervals; i++) {
    const interval = {
      median: 0,
      iqr: 0,
      q1: 0,
      q3: 0,
      min: 0,
      max: 0,
      completedAssessments: []
    }
    intervals.push(interval)
  }
  for (let name in students) { 
    if (name === 'currentStudent') {
      continue
    }
    const student = students[name] 
    student.progress.forEach((progress, index) => {
      intervals[index].completedAssessments.push(progress.assessments.length)
    })
    delete students[name]
  }
  students.intervals = intervals.map(interval => {
    assessments = interval.completedAssessments
    if (assessments.length != 0) {
      assessments.sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
      const length = assessments.length
      interval.median = median(assessments)
      interval.q3 = assessments[Math.floor(length*.75) - 1] 
      interval.q1 = assessments[Math.floor(length*.25) - 1] 
      interval.iqr = interval.q3 - interval.q1
      interval.min = Math.min.apply(null, assessments)
      interval.max = Math.max.apply(null, assessments)
    }
    return interval
  })
}

function median(numbers) {
  const length = numbers.length
  if ( length % 2 === 0 ) {
    return (numbers[length / 2 - 1] + numbers[length / 2]) / 2
  } else {
    return numbers[(length - 1) / 2]
  }
}
