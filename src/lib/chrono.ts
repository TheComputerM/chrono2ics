export interface ChronoSection {
	id: string;
	type: string;
	number: number;
	roomTime: string[];
}

export async function fetchChronoTimetable(id: string) {
	const response = await fetch(
		`https://www.chrono.crux-bphc.com/api/timetable/${id}`,
	);
	const data = await response.json();
	return data as {
		name: string;
		sections: ChronoSection[];
    examTimes: string[];
	};
}