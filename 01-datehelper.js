function toMonthYear(date) {
  return new Date(date).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function isLeapYear(date) {
  return new Date(date).getFullYear() % 4 === 0;
}
