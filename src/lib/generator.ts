import * as ics from "ics";
import type { fetchChronoTimetable, ChronoSection } from "./chrono";
import { formatISO } from "date-fns";

function getMidsemExclusionTimes(examTimes: string[]) {
	return examTimes.reduce(
		(acc, timeString) => {
			const [, type, startTime] = timeString.split("|");
			if (type === "COMPRE") {
				return acc;
			}

			const startDate = new Date(startTime);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setSeconds(0);

			// date when midsems start
			if (acc[0].getTime() > startDate.getTime()) {
				acc[0] = startDate;
			}

			// date when midsems end
			if (acc[1].getTime() < startDate.getTime()) {
				acc[1] = startDate;
			}

			return acc;
		},
		[new Date(2077, 1), new Date(2024, 1)] satisfies [Date, Date],
	);
}

function getCompreStart(examTimes: string[]) {
	return examTimes.reduce((acc, timeString) => {
		const [, type, startTime] = timeString.split("|");
		if (type === "COMPRE") {
			const startDate = new Date(startTime);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setSeconds(0);

			if (acc.getTime() > startDate.getTime()) {
				return startDate;
			}
		}

		return acc;
	}, new Date(2077, 1));
}

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
			recurrenceRule: "FREQ=WEEKLY;INTERVAL=1",
			productId: "thecomputerm/chrono2ics",
			start: startDate.getTime(),
			duration: {
				minutes: 50,
			},
		};
	});
}

export async function generateICS(
	timetable: Awaited<ReturnType<typeof fetchChronoTimetable>>,
) {
	let events = timetable.sections.flatMap(generateSectionEvent);
	const [midsemStart, midsemEnd] = getMidsemExclusionTimes(timetable.examTimes);
	const compreStart = getCompreStart(timetable.examTimes);

	events = events.map((event) => ({
		...event,
		exclusionDates: [midsemStart.getTime(), midsemEnd.getTime()],
		recurrenceRule: `${event.recurrenceRule};UNTIL=${formatISO(compreStart, { format: "basic" })}`,
	}));

	const { value, error } = ics.createEvents(events);
	if (!value) throw error;

	return value;
}
