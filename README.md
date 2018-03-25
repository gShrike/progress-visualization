# Student Advancement Progress

https://student-assessment-progress.herokuapp.com/

Overall, we need to know how long it takes students to advance through the standards. Given a cohort start date and end date, we know that it's not linear- the back half of the program moves much quicker than the front half... but _how much_ quicker?

## Tasks

- [x] job number one is plotting that curve- % through the program on the x axis, number of standards (in order) completed on the Y
As a stretch, taking a median average is OK, but what I'd _really_ like to see is the distribution at each point. What's the density of students who have completed 5 standards at 10% through the program? 7 standards? 0 standards?

- [x] job number two is being to plot a particular student's progress *against* that line
what was the path they took, and are they current above the median or below the median? How far above and below?

- [] job number three is being able to adjust the end date for a student and repaint their curve accordingly
we want to be able to play with the end date to see if that puts them above the curve, so we can better calculate extensions
  - find scatterplot equation for main line and student line
  - extend y axis, calculate collision, etc
