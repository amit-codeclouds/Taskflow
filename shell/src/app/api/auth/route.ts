export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'taskflow_session=stub; Path=/; HttpOnly; SameSite=Lax',
    },
  });
}
