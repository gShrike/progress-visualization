const SUBMISSIONS_URL = 'https://galvanize-tir-api.herokuapp.com/submissions'
let student = getUrlStudent()
let cache

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
    cache.data = LZString.decompress(cache.data)
    return Promise.resolve()
  } else {
    return fetch(SUBMISSIONS_URL)
      .then(data => data.json())
      .then(data => {
        const compressed = LZString.compress(JSON.stringify(data));
        cache = { data: compressed, date: new Date() }
        localStorage.setItem('submissions', JSON.stringify(cache))
      })
  }
}

function displayDataDate(date) {
  // TODO: display date variable to html
  console.log(date)
}

function getGraphData() {
  let url = '/graph'
  if (student) {
    url = `${url}?student=${student}`
  }
  return fetch(url).then(data => data.text())
}

function getStudents() {
  return fetch('/students').then(data => data.json())
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
  selectNoneOption.innerText = '<<None>>'
  selectOption.setAttribute("disabled", "")
  selectOption.setAttribute("selected", "")
  dropdown.appendChild(selectOption)
  dropdown.appendChild(selectNoneOption)
  dropdown.onchange = displayStudentLine
  students.forEach(student => {
    const option = document.createElement('option')
    option.innerText = student
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
  student = selectedStudent
  // TODO: change url to current student
}

function getUrlStudent() {
  // TODO: set student from url with setCurrentStudent
}

function displayError(error) {
  // TODO: display error message
  console.error(error)  
}
