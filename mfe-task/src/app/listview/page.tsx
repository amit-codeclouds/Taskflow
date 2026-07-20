import { Suspense } from 'react';
import TeamTaskBoardScreen from '@/components/tasks/TeamTaskBoardScreen';

export const metadata = { title: 'Team Tasks — Taskflow' };

export default function TeamTaskListViewPage() {
  return (
    <Suspense>
      <TeamTaskBoardScreen />
    </Suspense>
  );
}
