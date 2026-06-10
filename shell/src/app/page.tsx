export default function Home() {
  return (
    <section style={{ maxWidth: 720, padding: '48px 40px' }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: '#6155DD', textTransform: 'uppercase' }}>
        Phase 0 · Multi-Zones Foundation
      </p>
      <h1 style={{ margin: '8px 0 0', fontSize: 40, fontWeight: 600 }}>
        Welcome to Taskflow
      </h1>
      <p style={{ marginTop: 16, color: '#ABAAA5', lineHeight: 1.7, fontSize: 15 }}>
        Three independent apps — Shell, Task MFE, and Board MFE — composed into one
        product via Next.js Multi-Zones and a Cloudflare Worker router.
      </p>
      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <a
          href="/tasks"
          style={{
            background: '#6155DD',
            color: '#F4F3F0',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Go to Tasks
        </a>
        <a
          href="/board"
          style={{
            background: 'transparent',
            color: '#F4F3F0',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid #2a2a2f',
          }}
        >
          Go to Board
        </a>
      </div>
    </section>
  );
}
