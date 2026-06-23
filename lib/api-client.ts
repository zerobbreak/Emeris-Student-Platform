export async function apiClient<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message ?? "Request failed");
  }

  return (json.data ?? json) as T;
}

export async function apiClientFormData<T>(
  input: RequestInfo | URL,
  formData: FormData,
): Promise<T> {
  const response = await fetch(input, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Upload failed");
  }

  return (json.data ?? json) as T;
}
