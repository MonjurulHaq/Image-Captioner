export type ErrorType<T = unknown> = { status: number; data: T };
export type BodyType<T> = T;

export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("sondhan_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }
  
  // if 204 No Content, don't try to parse json
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null as unknown as Promise<T>;
  }

  return response.json().catch(() => ({})) as Promise<T>;
};
