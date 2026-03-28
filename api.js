// Backend base URL.
// Same origin when Express serves the app on port 3000; Live Server (e.g. :5500) uses localhost:3000.
function getApiBase() {
  if (typeof window === "undefined") return "http://localhost:3000";
  if (window.location.protocol === "file:") return "http://localhost:3000";
  const h = window.location.hostname;
  const p = window.location.port;
  if ((h === "localhost" || h === "127.0.0.1") && p === "3000") return "";
  return "http://localhost:3000";
}

const API_BASE = getApiBase();

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  options.signal = controller.signal;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const msg = (data && data.error) ? data.error : `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('🔴 Request timeout. Server may be slow or not responding.');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('🔴 Cannot connect to backend server. Please ensure the backend is running on localhost:3000');
    }
    
    throw error;
  }
}

