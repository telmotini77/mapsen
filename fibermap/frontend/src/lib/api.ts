export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const ACCESS_TOKEN_KEY = 'fibermap.accessToken';
const REFRESH_TOKEN_KEY = 'fibermap.refreshToken';

export const CONNECTION_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Comprueba que el backend esté en ejecución e inténtalo de nuevo.';

// El navegador solo dice "Failed to fetch" cuando no logra hablar con el servidor (caído,
// reiniciándose, sin red). Este error lo sustituye por un mensaje que el usuario entiende y
// permite a la interfaz distinguir "sin conexión" de un error normal de la petición.
export class ApiConnectionError extends Error {
  constructor() {
    super(CONNECTION_ERROR_MESSAGE);
    this.name = 'ApiConnectionError';
  }
}

export const isConnectionError = (error: unknown): error is ApiConnectionError => error instanceof ApiConnectionError;

function getTokens() {
  try {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function setTokens(accessToken: string, refreshToken: string) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // Storage unavailable (private browsing, etc). The session simply won't persist.
  }
}

function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// fetch con reintentos ante fallos de red. Solo las lecturas (GET/HEAD) se reintentan: repetir
// un POST/PATCH/DELETE que quizá sí llegó al servidor podría duplicar o alterar datos.
async function networkFetch(url: string, init: RequestInit): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const retries = method === 'GET' || method === 'HEAD' ? 2 : 0;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (init.signal?.aborted) throw error;
      if (attempt >= retries) throw new ApiConnectionError();
      await sleep(400 * 2 ** attempt);
    }
  }
}

// Extrae el mensaje legible de una respuesta de error de la API (string o lista de validación).
export function errorMessage(body: unknown, fallback: string): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (!message) return fallback;
  return Array.isArray(message) ? message.join('. ') : String(message);
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  let res: Response;
  try {
    res = await networkFetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Servidor inaccesible: no es motivo para cerrar la sesión, se conservan los tokens.
    return null;
  }

  if (res.status === 401 || res.status === 403) {
    clearTokens();
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

// Petición sin sesión (login, registro): sin token y con error de conexión legible.
export function publicFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return networkFetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
}

// Wraps fetch with the stored access token and a single transparent refresh-and-retry on 401.
// Lanza ApiConnectionError si el servidor no responde.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken } = getTokens();

  const doFetch = (token: string | null) =>
    networkFetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}

// Petición + lectura del JSON en un solo paso: si la respuesta no es exitosa lanza un Error con
// el mensaje del servidor, de modo que nunca se guarda un cuerpo de error como si fueran datos.
export async function apiJson<T = any>(path: string, options: RequestInit = {}, fallback = 'No se pudo completar la solicitud'): Promise<T> {
  const res = await apiFetch(path, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(errorMessage(body, fallback));
  return body as T;
}

// Igual que apiJson pero garantiza un arreglo, para listas que se recorren con .map().
export async function apiList<T = any>(path: string, fallback = 'No se pudo cargar la lista'): Promise<T[]> {
  const body = await apiJson<unknown>(path, {}, fallback);
  return Array.isArray(body) ? (body as T[]) : [];
}

// Comprueba si el servidor y su base de datos responden (endpoint público /health).
export async function pingServer(timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export const auth = { getTokens, setTokens, clearTokens };
