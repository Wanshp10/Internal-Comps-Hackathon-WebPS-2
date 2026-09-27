const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) throw new Error("Backend URL is not configured. Set VITE_API_BASE_URL in .env.");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  if (response.status === 204) return null;
  return response.json();
}