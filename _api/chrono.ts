export default async function handler() {
  return new Response('Edge Function Test: OK', {
    status: 200,
  });
}