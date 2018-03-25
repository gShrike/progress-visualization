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
  const doc = document.querySelector('iframe').contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
}

function populateDropdown(students) {
  const container = document.querySelector('.dropdown')
  container.innerHTML = ''
  const dropdown = document.createElement('select')
  dropdown.onchange = displayStudentLine
  students.forEach(student => {
    const option = document.createElement('option')
    option.innerText = student
    dropdown.appendChild(option)
  })
  container.append(dropdown)
  console.log(students)
}

function displayStudentLine(event) {
  generateGraph(event.target.value)
}
