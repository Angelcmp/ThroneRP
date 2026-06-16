const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}
