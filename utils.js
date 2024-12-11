const parseTimeToDate = (time) => {
  const [hourMinute, period] = time.split(" ");
  const [hours, minutes] = hourMinute.split(":").map(Number);
  let hours24 = +hours;
  if (period === "PM" && hours !== 12) {
    hours24 += 12;
  } else if (period === "AM" && hours === 12) {
    hours24 = 0;
  }
  return new Date(2000, 0, 1, hours24, minutes);
}

const sortSlots = (slots) => {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  slots.sort((prev, next) => {
		const prevStartTime = prev.start_time;
		const nextStartTime = next.start_time;
    const dayOrder =
      weekdays.indexOf(prevStartTime.slice(0, 3)) - weekdays.indexOf(nextStartTime.slice(0, 3));
    if (dayOrder !== 0) {
      return dayOrder;
    }
    const prevDate = parseTimeToDate(prevStartTime.slice(4));
    const nextDate = parseTimeToDate(nextStartTime.slice(4));

    return prevDate.getTime() - nextDate.getTime();
  });
  return slots;
};

module.exports = {
  sortSlots,
};
