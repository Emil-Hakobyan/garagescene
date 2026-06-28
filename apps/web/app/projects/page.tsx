import Link from 'next/link';
import { Suspense } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { fetchProjects } from '@/lib/server-api';
import { ProjectFilters as ProjectFiltersType } from '@/lib/types/project';

interface ProjectsPageProps {
  searchParams: Promise<ProjectFiltersType>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const filters = await searchParams;
  const projects = await fetchProjects(filters);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              GarageScene
            </Link>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Discover Projects
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Raw ideas, unfinished scripts, and garage-born films looking for
              the right collaborators.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200"
          >
            Start a Project
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="mb-10 h-28 animate-pulse border border-zinc-800 bg-zinc-900/40" />
          }
        >
          <ProjectFilters />
        </Suspense>

        {projects.length === 0 ? (
          <div className="mt-10 border border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
            <p className="text-zinc-500">No projects match your filters yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
