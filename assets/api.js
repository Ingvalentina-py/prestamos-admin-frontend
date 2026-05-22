const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://backend-loan-system.vercel.app/api";

function getToken() {
  return localStorage.getItem("token");
}

function formatApiError(data, fallback) {
  const message = data?.message || fallback;
  if (data?.detail) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    return `${message} (${detail})`;
  }
  return message;
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!options.skipJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {}

  if (!response.ok) {
    const err = new Error(formatApiError(data, "Error en la solicitud"));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
