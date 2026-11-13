const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("fintrack_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                response.status === 401
                    ? "Session expired or invalid. Please log in again."
                    : "Access forbidden. Check your login session and backend security configuration."
            );
        }

        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}

export function saveToken(token) {
    if (!token) {
        throw new Error("Cannot save an empty access token.");
    }

    localStorage.setItem("fintrack_token", token);
}

export function clearToken() {
    localStorage.removeItem("fintrack_token");
}