import Link from 'next/link';
import { RolesNeededBadges } from '@/components/projects/RolesNeededBadges';
import { formatLabel } from '@/lib/constants/profile';
import { STAGE_COLORS } from '@/lib/constants/projects';
import { Project } from '@/lib/types/project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project._id}`}
      className="group flex h-full flex-col border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-500 hover:bg-zinc-900/70"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-100">
          {project.title}
        </h2>
        <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black">
          {formatLabel(project.genre)}
        </span>
      </div>

      <p
        className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${STAGE_COLORS[project.stage] ?? 'text-zinc-400'}`}
      >
        {formatLabel(project.stage)}
      </p>

      <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-400">
        {project.teaser}
      </p>

      <RolesNeededBadges
        roles={project.rolesNeeded}
        customRole={project.customRoleNeeded}
      />
    </Link>
  );
}
