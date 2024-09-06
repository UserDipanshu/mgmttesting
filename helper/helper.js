// Fetching current date and time in IST with AM/PM notation
const options = {
  timeZone: "Asia/Kolkata",
  hour12: true, // 12-hour format with AM/PM
  year: "numeric",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const currentDateTime = () => {
  return new Date().toLocaleString("en-US", options);
};

export default currentDateTime;
