export const API_URL = 'http://localhost:5000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const tokenRaw = localStorage.getItem('taskflow-auth-v1');
  let token = null;
  if (tokenRaw) {
    try {
      const parsed = JSON.parse(tokenRaw);
      token = parsed?.token;
    } catch(e) {}
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};
