import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StarRating } from '@/components/ui/StarRating';
import { formatLabel } from '@/lib/constants/profile';
import { UserProfile } from '@/lib/types/user';

async function fetchUser(id: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatLocation(location?: UserProfile['location']): string | null {
  if (!location) {
    return null;
  }

  return [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ');
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchUser(id);

  if (!user) {
    notFound();
  }

  const location = formatLocation(user.location);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          GarageScene
        </Link>

        <div className="mt-10 border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-28 w-28 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-3xl font-bold text-white">
                {getInitials(user.name)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {user.name}
              </h1>

              {location && (
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-500">
                  {location}
                </p>
              )}

              {user.bio && (
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
                  {user.bio}
                </p>
              )}

              <div className="mt-8">
                <StarRating rating={user.averageRating ?? 0} />
              </div>

              <button
                type="button"
                disabled
                className="mt-8 border border-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500"
              >
                Send message
              </button>
              <p className="mt-2 text-xs text-zinc-600">Messaging coming soon</p>
            </div>
          </div>

          {(user.roles?.length || user.customRole) && (
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role) => (
                  <span
                    key={role}
                    className="border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.15em] text-zinc-300"
                  >
                    {formatLabel(role)}
                  </span>
                ))}
                {user.customRole && (
                  <span className="border border-white px-3 py-2 text-xs uppercase tracking-[0.15em] text-white">
                    {user.customRole}
                  </span>
                )}
              </div>
            </div>
          )}

          {user.genreTags && user.genreTags.length > 0 && (
            <div className="mt-8 border-t border-zinc-800 pt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.genreTags.map((genre) => (
                  <span
                    key={genre}
                    className="bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-black"
                  >
                    {formatLabel(genre)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {user.portfolio && user.portfolio.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Portfolio
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.portfolio.map((item) => {
                const href =
                  item.type === 'link' ? item.url : item.fileUrl ?? '#';

                return (
                  <a
                    key={item._id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-500"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-zinc-200">
                        {item.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                        {item.type}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-zinc-400">{item.description}</p>
                    )}
                    <p className="mt-4 text-xs uppercase tracking-[0.15em] text-zinc-500 group-hover:text-white">
                      View work →
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
