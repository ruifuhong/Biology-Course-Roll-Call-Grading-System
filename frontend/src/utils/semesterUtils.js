export const generateSemesterOptions = () => {
  const options = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  let academicYear = currentYear - 1911;
  if (currentMonth >= 8) {
    academicYear = currentYear - 1911;
  } else {
    academicYear = currentYear - 1912;
  }
  
  let currentSemesterNum = currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
  
  const startYear = 113;
  
  for (let year = academicYear; year >= startYear; year--) {
    const startSemester = 1;
    const endSemester = (year === academicYear) ? currentSemesterNum : 2;
    for (let sem = endSemester; sem >= startSemester; sem--) {
      const semesterCode = `${year}${sem}`;
      const semesterLabel = `${year}-${sem}`;
      options.push({
        value: semesterCode,
        label: `${semesterLabel}`
      });
    }
  }
  return options;
};

export const academicToCalendarYear = (academicYear) => {
  return academicYear + 1911;
};

export const calendarToAcademicYear = (calendarYear) => {
  return calendarYear - 1911;
};

export const getCurrentAcademicYear = (currentDate = new Date()) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (currentMonth >= 8) {
    return currentYear - 1911;
  } else {
    return currentYear - 1912;
  }
};

export const getCurrentSemesterNumber = (currentDate = new Date()) => {
  const currentMonth = currentDate.getMonth() + 1;
  return currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
};