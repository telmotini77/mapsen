import { Activity, MapPin, Server, Users, GitPullRequest, Layers, Check, Clock } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const FEATURES = [
  {
    icon: MapPin,
    title: 'Mapa FTTH interactivo',
    description: 'Visualiza ODF, mangas, cajas NAP y fibras sobre un mapa real con PostGIS.',
    available: true,
  },
  {
    icon: Server,
    title: 'Gestión de red',
    description: 'Administra ODF, mangas de distribución, de paso y de empalme, splitters 1:8 y 1:16, y la capacidad de cada elemento.',
    available: true,
  },
  {
    icon: Users,
    title: 'Clientes y viabilidad',
    description: 'Verifica si una dirección tiene cobertura y puertos disponibles antes de venderla.',
    available: true,
  },
  {
    icon: GitPullRequest,
    title: 'Editor de fusiones',
    description: 'Conecta hilos, splitters y patch cords dentro de cada manga o caja NAP.',
    available: false,
  },
  {
    icon: Layers,
    title: 'Trazabilidad óptica',
    description: 'Rastrea la continuidad de la señal desde el ODF hasta el cliente final.',
    available: false,
  },
];

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <Activity className="landing-logo-icon" aria-hidden="true" />
          <span>FiberMap</span>
        </div>
        <nav className="landing-header-actions" aria-label="Cuenta">
          <button className="btn-ghost" onClick={onLoginClick}>
            Iniciar sesión
          </button>
          <button className="btn-solid" onClick={onRegisterClick}>
            Crear cuenta
          </button>
        </nav>
      </header>

      <section className="landing-hero" aria-label="Presentación">
        <h1>
          Diseña, documenta y opera tu red <span>FTTH</span> en un solo lugar
        </h1>
        <p>
          FiberMap es una plataforma independiente de gestión de infraestructura de fibra óptica
          (FTTH/GPON/XGS-PON): mapa de red, inventario, capacidad, clientes y trazabilidad óptica.
        </p>
        <div className="landing-hero-actions">
          <button className="btn-solid btn-large" onClick={onRegisterClick}>
            Crear cuenta gratis
          </button>
          <button className="btn-ghost btn-large" onClick={onLoginClick}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

      <section className="landing-features" aria-label="Características">
        {FEATURES.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <feature.icon className="feature-icon" aria-hidden="true" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <span className={`feature-status ${feature.available ? 'available' : 'soon'}`}>
              {feature.available ? <Check size={14} aria-hidden="true" /> : <Clock size={14} aria-hidden="true" />}
              {feature.available ? 'Disponible' : 'Próximamente'}
            </span>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        <p>FiberMap — plataforma de gestión de redes FTTH.</p>
      </footer>
    </div>
  );
}
