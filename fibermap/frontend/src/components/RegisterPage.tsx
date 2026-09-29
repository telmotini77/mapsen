import { useState, type FormEvent } from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import DismissibleAlert from './DismissibleAlert';

interface RegisterPageProps {
  onBackToLogin: () => void;
  onBack: () => void;
}

export default function RegisterPage({ onBackToLogin, onBack }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
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
        <p className="login-subtitle">Crear una cuenta nueva</p>

        <label className="login-label" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          className="login-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />

        <label className="login-label" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="login-label" htmlFor="reg-password">
          Contraseña
        </label>
        <input
          id="reg-password"
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby="reg-password-hint"
          minLength={8}
          required
        />
        <small id="reg-password-hint" className="login-hint">Mínimo 8 caracteres</small>

        <label className="login-label" htmlFor="confirm-password">
          Confirmar contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && <DismissibleAlert className="login-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <button type="button" className="login-link" onClick={onBackToLogin}>
          Ya tengo una cuenta
        </button>
        <button type="button" className="login-link login-link-muted" onClick={onBack}>
          ← Volver al inicio
        </button>
      </form>
    </div>
  );
}
