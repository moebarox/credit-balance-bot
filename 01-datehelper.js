function toMonthYear(date) {
  return new Date(date).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
