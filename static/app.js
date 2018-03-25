generateGraph()
generateDropdown()

function generateGraph(student) {
  let url = '/graph'
  if (student) {
    url = `${url}?student=${student}`
  }
  fetch(url)
    .then(data => data.text())
    .then(displayGraph)
    .catch(console.error)
}

function generateDropdown() {
  fetch('/students')
    .then(data => data.json())
    .then(populateDropdown)
    .catch(console.error)
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
  generateGraph(event.target.value)
}

function displayLoading() {
  const loading = document.querySelector('.loading')
  loading.style.display = 'inline'
}

function hideLoading() {
  const loading = document.querySelector('.loading')
  loading.style.display = 'none'
}
