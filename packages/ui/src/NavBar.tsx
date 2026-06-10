'use client';

export function NavBar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#121215',
        borderBottom: '1px solid #222227',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a
          href="/"
          style={{ color: '#F4F3F0', fontSize: 18, fontWeight: 600, textDecoration: 'none' }}
        >
          Taskflow
        </a>
        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <a href="/" style={{ color: '#ABAAA5', textDecoration: 'none' }}>
            Home
          </a>
          <a href="/tasks" style={{ color: '#ABAAA5', textDecoration: 'none' }}>
            Tasks
          </a>
          <a href="/board" style={{ color: '#ABAAA5', textDecoration: 'none' }}>
            Board
          </a>
        </div>
      </nav>
    </header>
  );
}
