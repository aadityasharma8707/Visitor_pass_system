import { API_BASE } from "../config";

function selectTokenKey(path) {
  if (path.startsWith("/admin")) return "adminToken";
  if (path.startsWith("/visitor/host") || path.startsWith("/visitor/approve") || path.startsWith("/visitor/reject")) return "hostToken";
  if (path.startsWith("/visitor/approved") || path.startsWith("/visitor/entry") || path.startsWith("/visitor/exit")) return "securityToken";
  return null;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  // Attach role token automatically when available
  if (!headers.Authorization) {
    const tokenKey = selectTokenKey(path);
    if (tokenKey) {
      const token = localStorage.getItem(tokenKey);
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    ...options,
    headers
  };

  const response = await fetch(url, fetchOptions);

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // If token is invalid or expired, clear the stored token to avoid repeated 401s.
    if (response.status === 401) {
      const tokenKey = selectTokenKey(path);
      if (tokenKey) localStorage.removeItem(tokenKey);
    }
    throw new Error(data.message || "An unexpected error occurred");
  }

  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data;
  }

  return data;
}

export const api = {
  get: (path, headers) => request(path, { method: "GET", headers }),
  post: (path, body, headers) => request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, headers }),
  put: (path, body, headers) => request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined, headers }),
  delete: (path, headers) => request(path, { method: "DELETE", headers }),
};

export default api;
