import * as ics from "ics";
import type { fetchChronoTimetable, ChronoSection } from "./chrono";

function getMidsemExclusionTimes(examTimes: string[]) {
	const output = examTimes.reduce(
		(acc, timeString) => {
			const [, type, startTime] = timeString.split("|");
			if (type === "COMPRE") {
				return acc;
			}

			const startDate = new Date(startTime);
			startDate.setHours(0, 0, 0, 0);

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
		[new Date(2077, 1), new Date(2020, 1)] satisfies [Date, Date],
	);

	return output;
}

function getCompreStart(examTimes: string[]) {
	const output = examTimes.reduce((acc, timeString) => {
		const [, type, startTime] = timeString.split("|");
		if (type === "COMPRE") {
			const startDate = new Date(startTime);
			startDate.setHours(0, 0, 0, 0);

			if (acc.getTime() > startDate.getTime()) {
				return startDate;
			}
		}

		return acc;
	}, new Date(2077, 1));

	return output;
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
tempDate.setHours(0, 0, 0, 0);
for (let i = 1; i <= 7; i++) {
	dayDefaultTimes[tempDate.getDay()] = new Date(tempDate);
	tempDate.setDate(tempDate.getDate() + 1);
}

function convertRoomTimeToEvent(
	section: ChronoSection,
	index: number,
	additional = 0,
) {
	const [course, classroom, day, slot] = section.roomTime[index].split(":");

	const startDate = new Date(dayDefaultTimes[dayIndexMap[day]]);
	startDate.setHours(Number.parseInt(slot) + 7);

	const output: ics.EventAttributes = {
		title: `${course} ${section.type}${section.number}`,
		location: classroom,
		recurrenceRule: "FREQ=WEEKLY;INTERVAL=1",
		productId: "thecomputerm/chrono2ics",
		start: startDate.getTime(),
		duration: {
			hours: additional ? additional : undefined,
			minutes: 50,
		},
	};

	return output;
}

function generateSectionEvent(section: ChronoSection) {
	const events: Array<ics.EventAttributes> = [];

	if (section.roomTime.length === 0) return events;

	let prev = 0;
	let additional = 0;

	for (let i = 1; i < section.roomTime.length; i++) {
		const [course, classroom, day, slot] = section.roomTime[i].split(":");
		const [prevCourse, prevClassroom, prevDay, prevSlot] =
			section.roomTime[prev].split(":");

		// if the current class is consecutive to the previous class, like in labs
		if (
			course === prevCourse &&
			classroom === prevClassroom &&
			day === prevDay &&
			Number.parseInt(slot) === Number.parseInt(prevSlot) + 1
		) {
			additional++;
			continue;
		}

		events.push(convertRoomTimeToEvent(section, prev, additional));

		prev = i;
	}

	events.push(convertRoomTimeToEvent(section, prev, additional));

	return events;
}

function formatDateToUTC(date: Date) {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	const seconds = String(date.getUTCSeconds()).padStart(2, "0");

	return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
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
		recurrenceRule: `${event.recurrenceRule};UNTIL=${formatDateToUTC(compreStart)}`,
	}));

	const { value, error } = ics.createEvents(events);
	if (!value) throw error;

	return value;
}
