import type { ChronoSection } from "./chrono";

const dayIndexMap: Record<string, number> = {
  S: 0,
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  Sa: 6,
};

/** Stores Date objects for every day in the next week starting from today */
const dayDefaultTimes = Array(7).fill(null);
const tempDate = new Date();
tempDate.setHours(0);
tempDate.setMinutes(0);
tempDate.setSeconds(0);
tempDate.setMilliseconds(0);
for (let i = 1; i <= 7; i++) {
  dayDefaultTimes[tempDate.getDay()] = new Date(tempDate);
  tempDate.setDate(tempDate.getDate() + 1);
}

export function generateSectionEvent(section: ChronoSection) {
  return section.roomTime.map((info) => {
    const [course, classroom, day, slot] = info.split(":");

    const startDate = new Date(dayDefaultTimes[dayIndexMap[day]]);
    startDate.setHours(Number.parseInt(slot) + 7);
    return {
      title: `${course} ${section.type}${section.number}`,
      location: classroom,
      recurrenceRule: "FREQ=WEEKLY",
      productId: "thecomputerm/chrono2ics",
      start: startDate.getTime(),
      duration: {
        hours: 1,
      },
    };
  });
}