import { useState, type FormEvent } from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import DismissibleAlert from './DismissibleAlert';

interface LoginPageProps {
  onRegisterClick: () => void;
  onBack: () => void;
}

export default function LoginPage({ onRegisterClick, onBack }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <Activity className="login-logo-icon" />
          <span>FiberMap</span>
        </div>
        <p className="login-subtitle">Gestión de infraestructura FTTH</p>

        <label className="login-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="login-label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <DismissibleAlert className="login-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>

        <button type="button" className="login-link" onClick={onRegisterClick}>
          Crear una cuenta nueva
        </button>
        <button type="button" className="login-link login-link-muted" onClick={onBack}>
          ← Volver al inicio
        </button>
      </form>
    </div>
  );
}
