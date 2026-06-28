import { Project, ProjectFilters } from '@/lib/types/project';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProjects(
  filters: ProjectFilters = {},
): Promise<Project[]> {
  const params = new URLSearchParams();

  if (filters.genre) params.set('genre', filters.genre);
  if (filters.stage) params.set('stage', filters.stage);
  if (filters.roleNeeded) params.set('roleNeeded', filters.roleNeeded);
  if (filters.city) params.set('city', filters.city);

  const query = params.toString();
  const url = `${baseURL}/projects${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function fetchProject(
  id: string,
  token?: string,
): Promise<Project | null> {
  try {
    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(`${baseURL}/projects/${id}`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
