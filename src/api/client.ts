const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Handles response parsing and error throwing */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
};

/** GET request */
const get = <T>(path: string): Promise<T> => {
  return fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' , "ngrok-skip-browser-warning": "true"},
  }).then(handleResponse<T>);
};

/** POST request with JSON body */
const post = <T>(path: string, body?: unknown): Promise<T> => {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse<T>);
};

/** PATCH request with JSON body */
const patch = <T>(path: string, body?: unknown): Promise<T> => {
  return fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse<T>);
};

export const apiClient = { get, post, patch };
