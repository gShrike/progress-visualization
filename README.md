# Student Advancement Progress

Overall, we need to know how long it takes students to advance through the standards. Given a cohort start date and end date, we know that it's not linear- the back half of the program moves much quicker than the front half... but _how much_ quicker?

## Tasks

- job number one is plotting that curve- % through the program on the x axis, number of standards (in order) completed on the Y
As a stretch, taking a median average is OK, but what I'd _really_ like to see is the distribution at each point. What's the density of students who have completed 5 standards at 10% through the program? 7 standards? 0 standards?

- parse csv
- gather student info
  - student name
  - student starting date
  - student last date
  - calculate increments of 5%, 9 days (9 days times 20 increments is 180 days, 5.9 months)
  - count number of completed assigments per date percentage per student
  - aggregate student date increment data
  - find median and interquartile range 
  - draw boxplot
- useful separate data for server
  - student names
  - individual student data
  - aggreagate student data increment 

- job number two is being to plot a particular student's progress *against* that line
what was the path they took, and are they current above the median or below the median? How far above and below?

- http://bokeh.pydata.org/en/latest/docs/reference/plotting.html#bokeh.plotting.figure.Figure.line
- build python server with client

- job number three is being able to adjust the end date for a student and repaint their curve accordingly
we want to be able to play with the end date to see if that puts them above the curve, so we can better calculate extensions

- find scatterplot equation for main line and student line
- extend y axis, calculate collision, etc
