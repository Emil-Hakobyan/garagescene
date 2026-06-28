import axios, { AxiosRequestConfig } from 'axios';
import { getToken } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

function withAuth(auth: boolean): AxiosRequestConfig {
  if (!auth) {
    return {};
  }

  const token = getToken();

  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export async function apiGet<T>(path: string, auth = false): Promise<T> {
  const { data } = await axios.get<T>(`${baseURL}${path}`, withAuth(auth));
  return data;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  auth = false,
): Promise<T> {
  const { data } = await axios.post<T>(
    `${baseURL}${path}`,
    body,
    withAuth(auth),
  );
  return data;
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  auth = false,
): Promise<T> {
  const { data } = await axios.put<T>(`${baseURL}${path}`, body, withAuth(auth));
  return data;
}

export async function apiDelete<T>(path: string, auth = false): Promise<T> {
  const { data } = await axios.delete<T>(`${baseURL}${path}`, withAuth(auth));
  return data;
}
