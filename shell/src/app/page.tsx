export default function Home() {
  return (
    <section style={{ maxWidth: 720, padding: '32px 40px' }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: '#6155DD' }}>
        PHASE 0 · MFE FOUNDATION
      </p>
      <h1 style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 600 }}>
        Welcome to Taskflow
      </h1>
      <p style={{ marginTop: 12, color: '#ABAAA5', lineHeight: 1.6 }}>
        The Shell (Next.js · localhost:3002) hosts the Task MFE (Next.js · localhost:3003)
        and the Board MFE (Angular · localhost:4200) via iframes, composed
        through the Cloudflare Worker at localhost:8787.
      </p>
      <ul style={{ marginTop: 20, paddingLeft: 20, color: '#F4F3F0', lineHeight: 1.8 }}>
        <li><a href="/tasks" style={{ color: '#6155DD' }}>/tasks</a> — Task MFE (Next.js)</li>
        <li><a href="/board" style={{ color: '#6155DD' }}>/board</a> — Board MFE (Angular)</li>
      </ul>
    </section>
  );
}
