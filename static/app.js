const SUBMISSIONS_URL = 'https://galvanize-tir-api.herokuapp.com/submissions'
const STUDENTS_URL = 'https://galvanize-tir-api.herokuapp.com/students'
const nonePlaceholder = '<<None>>'
const reloadButton = document.querySelector('.reload')

let student, cache

setUrlStudent()

reloadButton.addEventListener('click', reloadData)

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
        const compressed = LZString.compress(JSON.stringify(data.submissions));
        cache = { data: compressed, date: new Date().toDateString() }
        displayDataDate(cache.date)
        localStorage.setItem('submissions', JSON.stringify(cache))
      })
  }
}

function reloadData() {
  localStorage.clear()
  window.location.reload()
}

function displayDataDate(date) {
  document.querySelector('.cache').innerHTML = `Data Cached: ${date}`
}

function getGraphData() {
  document.querySelector('.loading').innerText = 'loading graph...'
  reloadButton.style.display = 'inline'
  let url = '/graph'
  if (student) {
    url = `${url}?student=${student}`
  }
  const information = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: cache.data
  }
  return fetch(url, information).then(data => data.text())
}

function getStudents() {
  document.querySelector('.loading').innerText = 'loading dropdown...'
  return fetch(STUDENTS_URL)
    .then(data => data.json())
    .then(response => {
      return response.students
        .filter(student => student.role === 'student')
        .filter(student => student.startDate && student.endDate)
        .map(student => student.fullName)
        .sort()
    })
}

function displayGraph(html) {
  hideLoading()
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
  if (!student) {
    selectOption.setAttribute('selected', '')
  }
  dropdown.appendChild(selectOption)
  dropdown.appendChild(selectNoneOption)
  dropdown.onchange = displayStudentLine
  students.forEach(name => {
    const option = document.createElement('option')
    option.innerText = name
    if (student === name) {
      option.setAttribute('selected', '')
    }
    dropdown.appendChild(option)
  })
  container.append(dropdown)
}

function displayStudentLine(event) {
  displayLoading()
  setCurrentStudent(event.target.value)
  getGraphData()
    .then(displayGraph)
    .catch(displayError)
}

function displayLoading() {
  const loading = document.querySelector('.loading')
  loading.style.display = 'inline'
}

function hideLoading() {
  const loading = document.querySelector('.loading')
  loading.style.display = 'none'
}

function setCurrentStudent(selectedStudent) {
  student = selectedStudent === nonePlaceholder ? '' : selectedStudent
  updateQueryStringParameter('student', student)
}

function setUrlStudent() {
  student = getParameterByName('student')
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
  window.history.replaceState({}, '', baseUrl + params)
}

function getParameterByName(name) {
  const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
