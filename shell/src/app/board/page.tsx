export default function BoardPage() {
  const src = process.env.NEXT_PUBLIC_BOARD_MFE_URL || 'http://localhost:4200';
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 'calc(100vh - 65px)', border: 'none', display: 'block' }}
      title="Kanban Board"
    />
  );
}
