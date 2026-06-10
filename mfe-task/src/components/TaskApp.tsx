import { useAuth } from '@/hooks/useAuth';

export default function TaskApp() {
  const { token } = useAuth();

  return (
    <section
      style={{
        background: '#222227',
        color: '#F4F3F0',
        borderRadius: 12,
        padding: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: '#6155DD' }}>
        PHASE 0 · MFE FOUNDATION
      </p>
      <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 600 }}>
        Task Management — coming soon
      </h2>
      <p style={{ margin: '12px 0 0', fontSize: 14, color: '#ABAAA5' }}>
        Task MFE (Next.js · localhost:3003)
      </p>
      <p style={{ marginTop: 16, fontSize: 12, color: '#ABAAA5' }}>
        Auth token from Shell:{' '}
        {token ? (
          <span style={{ color: '#32B173' }}>received</span>
        ) : (
          <span style={{ color: '#E09D34' }}>waiting…</span>
        )}
      </p>
    </section>
  );
}
