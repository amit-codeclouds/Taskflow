import WorkspaceDetailsScreen from '@/components/workspace/WorkspaceDetailsScreen';

export const metadata = { title: 'Workspace — Taskflow' };

export default function WorkspaceDetailsPage({ params }: { params: { id: string } }) {
  return <WorkspaceDetailsScreen workspaceId={params.id} />;
}
