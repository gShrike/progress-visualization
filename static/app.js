const SUBMISSIONS_URL = 'https://galvanize-tir-api.herokuapp.com/submissions'
const STUDENTS_URL = 'https://galvanize-tir-api.herokuapp.com/students'
const nonePlaceholder = '<<None>>'
const reloadButton = document.querySelector('.reload')
const loading = document.querySelector('.loading')
const startDate = document.querySelector('.start-date')
const endDate = document.querySelector('.end-date')
const endDatePicker = document.querySelector('.end-date input')

let student = {}
let modifiedEndDate = 'FALSE'
let cache

setUrlStudent()

reloadButton.addEventListener('click', reloadData)
endDatePicker.addEventListener('change', changeEndDate)
document.querySelector('.reset button').addEventListener('click', hideResetButton)

getSubmissions()
  .then(getGraphData)
  .then(displayGraph)
  .then(getStudents)
  .then(populateDropdown)
  .catch(displayError)

function getSubmissions() {
  const storedSubmissions = localStorage.getItem('submissions')
  if (storedSubmissions) {
    cache = JSON.parse(storedSubmissions)
    displayDataDate(cache.date)
    try {
      cache.data = LZString.decompress(cache.data)
      return Promise.resolve()
    } catch(error) {
      return Promise.reject(error)
    }
  } else {
    return fetch(SUBMISSIONS_URL)
      .then(data => data.json())
      .then(data => {
        const submissions = JSON.stringify(data.submissions)
        const compressed = LZString.compress(submissions);
        cache = { data: compressed, date: new Date().toDateString() }
        displayDataDate(cache.date)
        localStorage.setItem('submissions', JSON.stringify(cache))
        cache.data = submissions
      })
  }
}

function changeEndDate(event) {
  const newDate = event.target.value
  if (newDate) {
    modifiedEndDate = newDate
    student.endDate = modifiedEndDate
    displayLoading()
    getGraphData()
      .then(displayGraph)
      .then(showResetButton)
      .catch(displayError)
  }
}

function showResetButton() {
  document.querySelector('.end-date').style.color = '#FF0054'
  document.querySelector('.reset').style.display = 'inline'
  document.querySelector('.reset span').innerHTML = `<strong>Original</strong>: ${student.originalEndDate}`
}

function hideResetButton() {
  modifiedEndDate = 'FALSE'
  student.endDate = student.originalEndDate
  document.querySelector('.end-date').style.color = 'black'
  document.querySelector('.reset').style.display = 'none'
  getGraphData()
    .then(displayGraph)
    .catch(displayError)
}

function reloadData() {
  localStorage.clear()
  window.location.reload()
}

function displayDataDate(date) {
  document.querySelector('.cache').innerHTML = `<strong>Data Cached</strong>: ${date}`
}

function getGraphData() {
  loading.innerText = 'loading graph...'
  reloadButton.style.display = 'inline'
  let url = '/graph'
  if (student.fullName) {
    url = `${url}?student=${student.fullName}`
  }
  const information = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({submissions: cache.data, endDate: modifiedEndDate })
  }
  return fetch(url, information).then(data => data.text())
}

function getStudents() {
  loading.innerText = 'loading dropdown...'
  return fetch(STUDENTS_URL)
    .then(data => data.json())
    .then(response => {
      return response.students
        .filter(student => student.role === 'student')
        .filter(student => student.startDate && student.endDate)
        .map(({fullName, startDate, endDate}) => ({fullName, startDate, endDate}))
        .sort((a, b) => a.fullName > b.fullName ? 1 : a.fullName < b. fullName ? -1 : 0)
    })
}

function displayGraph(html) {
  hideLoading()
  if (student.startDate) {
    displayDates(student)
  }
  const doc = document.querySelector('iframe').contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
}

function populateDropdown(students) {
  hideLoading()
  const container = document.querySelector('.dropdown')
  const dropdown = document.createElement('select')
  const selectOption = document.createElement('option')
  const selectNoneOption = document.createElement('option')
  selectOption.innerText = 'Select Student'
  selectNoneOption.innerText = nonePlaceholder
  selectOption.setAttribute('disabled', '')
  if (!student.fullName) {
    selectOption.setAttribute('selected', '')
  }
  dropdown.appendChild(selectOption)
  dropdown.appendChild(selectNoneOption)
  dropdown.onchange = displayStudentLine
  students.forEach(currentStudent => {
    const option = document.createElement('option')
    option.innerText = currentStudent.fullName
    option.setAttribute('value', JSON.stringify(currentStudent))
    if (student.fullName === currentStudent.fullName) {
      option.setAttribute('selected', '')
      student = currentStudent
      student.originalEndDate = student.endDate
      displayDates(currentStudent)
    }
    dropdown.appendChild(option)
  })
  container.append(dropdown)
}

function displayStudentLine(event) {
  modifiedEndDate = 'FALSE'
  hideDates()
  displayLoading()
  setCurrentStudent(event.target.value)
  getGraphData()
    .then(displayGraph)
    .catch(displayError)
}

function displayLoading() {
  loading.style.display = 'inline'
}

function hideLoading() {
  loading.style.display = 'none'
}

function setCurrentStudent(selectedStudent) {
  student = selectedStudent === nonePlaceholder ? '' : JSON.parse(selectedStudent)
  student.originalEndDate = student.endDate
  updateQueryStringParameter('student', student.fullName)
}

function displayDates(student) {
  startDate.style.display = 'inline'
  endDate.style.display = 'inline'
  startDate.innerHTML = `<strong>Start</strong>: ${new Date(student.startDate).toDateString()}`
  endDatePicker.valueAsDate = new Date(student.endDate)
}

function hideDates() {
  startDate.style.display = 'none'
  endDate.style.display = 'none'
}

function setUrlStudent() {
  student.fullName = getParameterByName('student')
}

function displayError(error) {
  document.querySelector('.error').style.display = 'inline'
  console.error(error)  
}

function updateQueryStringParameter(key, value) {
  const baseUrl = [location.protocol, '//', location.host, location.pathname].join('')
  const urlQueryString = document.location.search
  const newParam = key + '=' + value
  let params = '?' + newParam

  if (urlQueryString) {
    updateRegex = new RegExp('([\?&])' + key + '[^&]*')
    removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?')
    if( typeof value == 'undefined' || value == null || value == '' ) {
      params = ''
    } else if (urlQueryString.match(updateRegex) !== null) {
      params = urlQueryString.replace(updateRegex, '$1' + newParam)
    } else { 
      params = urlQueryString + '&' + newParam
    }
  }
  window.history.pushState({}, '', baseUrl + params)
}

function getParameterByName(name) {
  const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
