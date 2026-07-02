import { API_BASE } from "../config";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  // Automatically inject active role tokens based on API endpoints
  if (path.startsWith("/admin") && !headers.Authorization) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if ((path.startsWith("/visitor/host") || path.startsWith("/visitor/approve") || path.startsWith("/visitor/reject")) && !headers.Authorization) {
    const hostToken = localStorage.getItem("hostToken");
    if (hostToken) {
      headers.Authorization = `Bearer ${hostToken}`;
    }
  } else if ((path.startsWith("/visitor/approved") || path.startsWith("/visitor/entry") || path.startsWith("/visitor/exit")) && !headers.Authorization) {
    const securityToken = localStorage.getItem("securityToken");
    if (securityToken) {
      headers.Authorization = `Bearer ${securityToken}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
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
