module.exports = getStudentProgression

function getStudentProgression(progress, assessments, sorted) {
  const datasets = formatDate(progress)
  const studentAverages = averageStudents(datasets)

  const progressData = filterEmpty({
    labels: assessments,
    datasets: studentAverages,
  })

  return sorted ? sortByDays(progressData) : progressData
}

function formatDate(progress) {
  return Object.keys(progress).reduce((datasets, student) => {
    const submissions = [...progress[student].data]
    const startingDate = findEarliestAssessmentDate(submissions)
    const data = []
    submissions.forEach(date => {
      if (date) {
        data.push(date.diff(startingDate, 'days'))
      } else {
        data.push(0)
      }
    })
    datasets.push({
      label: student,
      data,
      fill: false
    })
    return datasets
  }, [])
}

function averageStudents(datasets) {
  const newDataset = datasets.reduce((dataset, student) => {
    student.data.forEach((days, index) => {
      if (days) {
        dataset[0].data[index] = dataset[0].data[index] || { total: 0, count: 0 } 
        dataset[0].data[index].total += days
        dataset[0].data[index].count++
      }
    })
    return dataset
  }, [{ label: 'Student Average in Days', data: [], borderColor: "#8e5ea2", fill: false }])
  newDataset[0].data = newDataset[0].data.map(days => {
    return days.total / days.count
  })
  return newDataset
}


function sortByDays(data) {
  const combined = data.labels.map((label, index) => {
    return {label, dataset: data.datasets[0].data[index] }
  })
  combined.sort((a, b) => a.dataset - b.dataset)
  const sortedData = combined.reduce((sortedData, info) => {
    sortedData.labels.push(info.label)
    sortedData.datasets.push(info.dataset)
    return sortedData
  }, { labels: [], datasets: []})
  data.datasets[0].data = sortedData.datasets
  return {labels: sortedData.labels, datasets: data.datasets }
}

function filterEmpty(data) {
  const days = [...data.datasets[0].data]
  const newData = {
    labels: [],
    datasets: data.datasets
  }
  newData.datasets[0].data = []
  data.labels
    .map((label, index) => {
      return { label, dataset: days[index] }
    })
    .filter(data => {
      return !!data.dataset
    })
    .forEach(data => {
      newData.labels.push(data.label)
      newData.datasets[0].data.push(data.dataset)
    })
  return newData
}

function findEarliestAssessmentDate(submissions) {
  return submissions.reduce((earliest, submission) => {
    if (!submission) {
      return earliest
    }
    if (!earliest) {
      earliest = submission 
    } else if (earliest.diff(submission) > 0) {
      earliest = submission
    }
    return earliest
  }, '')
}
