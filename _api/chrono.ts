export async function POST(request: Request) {
	const { id } = await request.json();
	return await fetch(`https://www.chrono.crux-bphc.com/api/timetable/${id}`);
}
