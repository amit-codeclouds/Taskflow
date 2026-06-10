import dynamic from 'next/dynamic';

const BoardApp = dynamic(
  () => import('boardMfe/BoardApp').then((m) => m.BoardComponent),
  { ssr: false, loading: () => <p>Loading board...</p> }
);

export default function BoardPage() {
  return <BoardApp />;
}
