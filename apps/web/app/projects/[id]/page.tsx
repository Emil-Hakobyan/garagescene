import { notFound } from 'next/navigation';
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient';
import { fetchProject } from '@/lib/server-api';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient initialProject={project} />;
}
