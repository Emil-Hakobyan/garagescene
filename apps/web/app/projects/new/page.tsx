'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ProjectForm,
  ProjectFormValues,
} from '@/components/projects/ProjectForm';
import { apiPost } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { Project } from '@/lib/types/project';

export default function NewProjectPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleSubmit = async (values: ProjectFormValues) => {
    const project = await apiPost<Project>(
      '/projects',
      {
        title: values.title,
        teaser: values.teaser,
        fullDocument: values.fullDocument || undefined,
        genre: values.genre,
        stage: values.stage,
        rolesNeeded: values.rolesNeeded,
        customRoleNeeded: values.customRoleNeeded || undefined,
        mediaSnippets:
          values.mediaSnippets.length > 0 ? values.mediaSnippets : undefined,
      },
      true,
    );

    router.push(`/projects/${project._id}`);
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/projects"
          className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Back to Projects
        </Link>

        <div className="mt-8 mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            GarageScene
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Start a Project
          </h1>
          <p className="mt-3 text-zinc-400">
            Put your idea out there. Control who sees the full script.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/40 p-8">
          <ProjectForm submitLabel="Create Project" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
