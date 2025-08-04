export const headers = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
}

export async function POST(request: Request) {
	const { id } = await request.json();
	return await fetch(`https://www.chrono.crux-bphc.com/api/timetable/${id}`);
}
