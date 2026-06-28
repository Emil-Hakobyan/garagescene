'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ProjectForm,
  projectToFormValues,
  ProjectFormValues,
} from '@/components/projects/ProjectForm';
import { apiGet, apiPut } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { Project } from '@/lib/types/project';
import { UserProfile } from '@/lib/types/user';

function getOwnerId(owner: Project['owner']): string {
  return typeof owner === 'string' ? owner : owner._id;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const loadProject = async () => {
      try {
        const [user, projectData] = await Promise.all([
          apiGet<UserProfile>('/users/me', true),
          apiGet<Project>(`/projects/${params.id}`, true),
        ]);

        if (getOwnerId(projectData.owner) !== user._id) {
          router.replace(`/projects/${params.id}`);
          return;
        }

        setProject(projectData);
        setIsReady(true);
      } catch {
        setError('Failed to load project.');
        setIsReady(true);
      }
    };

    loadProject();
  }, [params.id, router]);

  const handleSubmit = async (values: ProjectFormValues) => {
    const updated = await apiPut<Project>(
      `/projects/${params.id}`,
      {
        title: values.title,
        teaser: values.teaser,
        fullDocument: values.fullDocument || undefined,
        genre: values.genre,
        stage: values.stage,
        rolesNeeded: values.rolesNeeded,
        customRoleNeeded: values.customRoleNeeded || undefined,
        mediaSnippets: values.mediaSnippets,
      },
      true,
    );

    router.push(`/projects/${updated._id}`);
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

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <p className="text-red-300">{error ?? 'Project not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/projects/${project._id}`}
          className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Back to Project
        </Link>

        <div className="mt-8 mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            GarageScene
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Edit Project
          </h1>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/40 p-8">
          <ProjectForm
            defaultValues={projectToFormValues(project)}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
