import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, auth, errorMessage, isConnectionError, publicFetch } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  // true cuando hay una sesión guardada pero el servidor no responde (no se cierra la sesión).
  serverOffline: boolean;
  retryConnection: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverOffline, setServerOffline] = useState(false);

  const restoreSession = useCallback(async () => {
    const { accessToken } = auth.getTokens();
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) {
        setUser((await res.json()) as AuthUser);
        setServerOffline(false);
      } else if (res.status === 401 || res.status === 403) {
        // Sesión vencida o inválida: recién aquí se descartan los tokens.
        auth.clearTokens();
        setServerOffline(false);
      } else {
        // Error 5xx: el servidor está en problemas, pero la sesión puede seguir siendo válida.
        setServerOffline(true);
      }
    } catch (error) {
      // Sin conexión: se conserva la sesión y se ofrece reintentar en lugar de expulsar al usuario.
      if (isConnectionError(error)) setServerOffline(true);
      else auth.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const authenticate = async (path: 'login' | 'register', body: Record<string, string>) => {
    // publicFetch convierte "Failed to fetch" en un mensaje claro de conexión.
    const res = await publicFetch(`/auth/${path}`, { method: 'POST', body: JSON.stringify(body) });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorMessage(errorBody, 'No se pudo completar la operación'));
    }

    const data = await res.json();
    auth.setTokens(data.accessToken, data.refreshToken);
    setServerOffline(false);
    setUser(data.user);
  };

  const login = (email: string, password: string) => authenticate('login', { email, password });

  const register = (name: string, email: string, password: string) =>
    authenticate('register', { name, email, password });

  const logout = () => {
    auth.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, serverOffline, retryConnection: restoreSession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
