// MARSHAL ERP - OFFICIAL GRADING & SGPA/CGPA CALCULATION ENGINE
// Follows official autonomous & UGC/AICTE 10-point credit system rules

export const GRADE_SCALE = [
  { minPercent: 90, grade: 'O',  point: 10, status: 'PASS', description: 'Outstanding' },
  { minPercent: 80, grade: 'A+', point: 9,  status: 'PASS', description: 'Excellent' },
  { minPercent: 70, grade: 'A',  point: 8,  status: 'PASS', description: 'Very Good' },
  { minPercent: 60, grade: 'B+', point: 7,  status: 'PASS', description: 'Good' },
  { minPercent: 55, grade: 'B',  point: 6,  status: 'PASS', description: 'Above Average' },
  { minPercent: 50, grade: 'C',  point: 5,  status: 'PASS', description: 'Average' },
  { minPercent: 40, grade: 'P',  point: 4,  status: 'PASS', description: 'Pass' },
  { minPercent: 0,  grade: 'F',  point: 0,  status: 'FAIL', description: 'Fail / Backlog' }
];

export function getGradeForPercentage(percentage, isAbsent = false) {
  if (isAbsent) {
    return { grade: 'Ab', point: 0, status: 'FAIL', description: 'Absent' };
  }
  const pct = Math.round(Number(percentage) * 100) / 100;
  for (const row of GRADE_SCALE) {
    if (pct >= row.minPercent) {
      return row;
    }
  }
  return { grade: 'F', point: 0, status: 'FAIL', description: 'Fail' };
}

/**
 * Calculates results for a student in an exam
 * @param {Array} courseMarks - Array of { course, components: [{ name, maxMarks, passingMarks, marksObtained, isAbsent }] }
 * @param {Array} priorSemesters - Array of { semester, sgpa, credits } for CGPA calculation
 */
export function calculateStudentResult(courseMarks, priorSemesters = []) {
  let totalCredits = 0;
  let earnedCredits = 0;
  let totalCreditPoints = 0;
  let hasFailedSubject = false;
  let failedSubjectsCount = 0;

  const coursesEvaluated = courseMarks.map(item => {
    const { course, components } = item;
    const credits = Number(course.credits);
    totalCredits += credits;

    let courseTotalMarks = 0;
    let courseMaxMarks = 0;
    let isAnyComponentAbsent = false;
    let isAnyComponentFailed = false;

    components.forEach(comp => {
      const max = Number(comp.max_marks);
      const obt = comp.is_absent ? 0 : Number(comp.marks_obtained || 0);
      courseMaxMarks += max;
      courseTotalMarks += obt;

      if (comp.is_absent) isAnyComponentAbsent = true;
      if (obt < Number(comp.passing_marks)) isAnyComponentFailed = true;
    });

    const percentage = courseMaxMarks > 0 ? (courseTotalMarks / courseMaxMarks) * 100 : 0;
    const gradeInfo = getGradeForPercentage(percentage, isAnyComponentAbsent);

    const isPassed = !isAnyComponentFailed && !isAnyComponentAbsent && gradeInfo.point >= 4;
    const gradePoint = isPassed ? gradeInfo.point : 0;
    const creditPoints = credits * gradePoint;

    if (isPassed) {
      earnedCredits += credits;
      totalCreditPoints += creditPoints;
    } else {
      hasFailedSubject = true;
      failedSubjectsCount++;
    }

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      courseType: course.course_type,
      credits,
      components,
      totalMarks: courseTotalMarks,
      maxMarks: courseMaxMarks,
      percentage: Math.round(percentage * 10) / 10,
      grade: isPassed ? gradeInfo.grade : 'F',
      gradePoint,
      creditPoints,
      isPassed
    };
  });

  const sgpa = totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100) / 100 : 0.00;

  // CGPA calculation factoring prior semesters
  let cumulativeCredits = totalCredits;
  let cumulativePoints = totalCreditPoints;

  priorSemesters.forEach(sem => {
    const semCredits = Number(sem.credits || 0);
    const semSgpa = Number(sem.sgpa || 0);
    cumulativeCredits += semCredits;
    cumulativePoints += (semCredits * semSgpa);
  });

  const cgpa = cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 : sgpa;

  let resultStatus = 'PASS';
  if (failedSubjectsCount > 0) {
    resultStatus = failedSubjectsCount <= 3 ? 'ATKT' : 'FAIL';
  }

  return {
    courses: coursesEvaluated,
    totalCredits,
    earnedCredits,
    totalCreditPoints,
    sgpa,
    cgpa,
    resultStatus,
    failedSubjectsCount
  };
}
