'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RolesNeededBadges } from '@/components/projects/RolesNeededBadges';
import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import { getToken, isAuthenticated } from '@/lib/auth';
import { formatLabel } from '@/lib/constants/profile';
import { STAGE_COLORS } from '@/lib/constants/projects';
import { fetchProject } from '@/lib/server-api';
import { Project } from '@/lib/types/project';
import { UserProfile } from '@/lib/types/user';

interface ProjectDetailClientProps {
  initialProject: Project;
}

function getOwnerId(owner: Project['owner']): string {
  return typeof owner === 'string' ? owner : owner._id;
}

function getOwnerName(owner: Project['owner']): string {
  return typeof owner === 'string' ? 'Unknown' : owner.name;
}

export function ProjectDetailClient({
  initialProject,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initialProject);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [grantUserId, setGrantUserId] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  const ownerId = getOwnerId(project.owner);
  const isOwner = currentUser?._id === ownerId;
  const hasFullDocument = Boolean(project.fullDocument);

  useEffect(() => {
    const loadAuthenticatedView = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        const [user, authenticatedProject] = await Promise.all([
          apiGet<UserProfile>('/users/me', true),
          fetchProject(project._id, getToken() ?? undefined),
        ]);

        setCurrentUser(user);

        if (authenticatedProject) {
          setProject(authenticatedProject);
        }
      } catch {
        // Keep public view if authenticated fetch fails
      }
    };

    loadAuthenticatedView();
  }, [project._id]);

  const handleGrantAccess = async () => {
    setAccessError(null);
    setAccessMessage(null);

    if (!grantUserId.trim()) {
      setAccessError('Enter a user ID to grant access.');
      return;
    }

    try {
      const updated = await apiPost<Project>(
        `/projects/${project._id}/access/${grantUserId.trim()}`,
        {},
        true,
      );
      setProject(updated);
      setGrantUserId('');
      setAccessMessage('Access granted.');
    } catch {
      setAccessError('Failed to grant access.');
    }
  };

  const handleMessageOwner = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (currentUser?._id === ownerId) {
      return;
    }

    router.push(`/chat?recipient=${ownerId}&project=${project._id}`);
  };

  const handleRevokeAccess = async (userId: string) => {
    setAccessError(null);
    setAccessMessage(null);

    try {
      const updated = await apiDelete<Project>(
        `/projects/${project._id}/access/${userId}`,
        true,
      );
      setProject(updated);
      setAccessMessage('Access revoked.');
    } catch {
      setAccessError('Failed to revoke access.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/projects"
          className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← All Projects
        </Link>

        <div className="mt-8 border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black">
                  {formatLabel(project.genre)}
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${STAGE_COLORS[project.stage] ?? 'text-zinc-400'}`}
                >
                  {formatLabel(project.stage)}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {project.title}
              </h1>

              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-zinc-500">
                By {getOwnerName(project.owner)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {isOwner && (
                <Link
                  href={`/projects/${project._id}/edit`}
                  className="border border-white px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-black"
                >
                  Edit Project
                </Link>
              )}

              {!isOwner && (
                <button
                  type="button"
                  onClick={handleMessageOwner}
                  className="border border-zinc-600 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:border-zinc-400 hover:bg-zinc-900"
                >
                  Message Owner
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Teaser
            </h2>
            <p className="text-lg leading-relaxed text-zinc-300">{project.teaser}</p>
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Full Document
            </h2>
            {hasFullDocument ? (
              <div className="whitespace-pre-wrap border border-zinc-800 bg-zinc-950/60 p-6 text-zinc-300">
                {project.fullDocument}
              </div>
            ) : (
              <p className="border border-zinc-800 bg-zinc-950/40 px-6 py-8 text-zinc-500">
                Request access by messaging the owner
              </p>
            )}
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Roles Needed
            </h2>
            <RolesNeededBadges
              roles={project.rolesNeeded}
              customRole={project.customRoleNeeded}
            />
          </div>

          {project.mediaSnippets && project.mediaSnippets.length > 0 && (
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Media
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {project.mediaSnippets.map((snippet, index) => (
                  <a
                    key={`${snippet.url}-${index}`}
                    href={snippet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-zinc-500"
                  >
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                      {formatLabel(snippet.type)}
                    </p>
                    <p className="mt-2 truncate text-sm text-white">{snippet.url}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {isOwner && (
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Access Management
              </h2>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={grantUserId}
                  onChange={(event) => setGrantUserId(event.target.value)}
                  placeholder="User ID to grant access"
                  className="flex-1 border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
                />
                <button
                  type="button"
                  onClick={handleGrantAccess}
                  className="border border-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-white hover:text-black"
                >
                  Grant Access
                </button>
              </div>

              {accessError && (
                <p className="mb-4 text-sm text-red-400">{accessError}</p>
              )}
              {accessMessage && (
                <p className="mb-4 text-sm text-emerald-400">{accessMessage}</p>
              )}

              <div className="space-y-3">
                {(project.accessList ?? []).map((userId) => {
                  const isProjectOwner = userId === ownerId;

                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                    >
                      <span className="font-mono text-sm text-zinc-300">
                        {userId}
                        {isProjectOwner && (
                          <span className="ml-3 text-xs uppercase tracking-[0.15em] text-zinc-500">
                            Owner
                          </span>
                        )}
                      </span>
                      {!isProjectOwner && (
                        <button
                          type="button"
                          onClick={() => handleRevokeAccess(userId)}
                          className="text-xs font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
