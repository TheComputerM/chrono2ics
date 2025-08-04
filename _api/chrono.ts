export async function POST(request: Request) {
  const { id } = await request.json();
  return new Response(`ID is ${id}`);
}