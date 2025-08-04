export async function POST(request: Request) {
	const { id } = await request.json();
	const response = await fetch(`https://www.chrono.crux-bphc.com/api/timetable/${id}`);
  const data = await response.json();
  return Response.json(data);
}
