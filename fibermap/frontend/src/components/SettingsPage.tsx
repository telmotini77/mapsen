import { useEffect, useState } from 'react';
import { Eye, MapPinned, Save, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import './SettingsPage.css';
import DismissibleAlert from './DismissibleAlert';

export interface AppPreferences {
  showLegend: boolean;
  showImportedPoles: boolean;
  confirmDestructiveActions: boolean;
}

interface SettingsPageProps {
  user: { name?: string; email: string; roles: string[] };
  preferences: AppPreferences;
  onPreferencesSaved: (preferences: AppPreferences) => void;
}

const optionCopy = [
  { key: 'showLegend' as const, icon: Eye, title: 'Leyenda de infraestructura', detail: 'Muestra automáticamente la referencia de ODF, manga, NAP, postes y cables en el mapa.' },
  { key: 'showImportedPoles' as const, icon: MapPinned, title: 'Postes importados KMZ', detail: 'Visualiza los puntos negros de postes cargados desde archivos KMZ.' },
  { key: 'confirmDestructiveActions' as const, icon: ShieldCheck, title: 'Confirmar eliminaciones', detail: 'Solicita confirmación antes de eliminar elementos de red desde el mapa.' },
];

export default function SettingsPage({ user, preferences, onPreferencesSaved }: SettingsPageProps) {
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(preferences), [preferences]);

  const save = async () => {
    setSaving(true); setMessage(null); setError(null);
    try {
      const response = await apiFetch('/auth/preferences', { method: 'PATCH', body: JSON.stringify(draft) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? 'No se pudieron guardar los ajustes.');
      onPreferencesSaved(body);
      setMessage('Ajustes guardados para tu cuenta.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudieron guardar los ajustes.');
    } finally { setSaving(false); }
  };

  return <div className="view-panel settings-page">
    <header className="panel-header"><h2>Ajustes</h2><p>Personaliza cómo trabajas con FiberMap. Las preferencias se guardan en tu cuenta.</p></header>
    <div className="settings-layout">
      <section className="settings-card settings-account"><h3>Cuenta activa</h3><dl><div><dt>Nombre</dt><dd>{user.name || 'Usuario FiberMap'}</dd></div><div><dt>Correo</dt><dd>{user.email}</dd></div><div><dt>Rol</dt><dd>{user.roles.join(', ') || 'Sin rol asignado'}</dd></div></dl></section>
      <section className="settings-card"><h3>Visualización y seguridad</h3><div className="settings-options">{optionCopy.map(({ key, icon: Icon, title, detail }) => <label className="settings-option" key={key}><Icon size={20} aria-hidden="true" /><span><strong>{title}</strong><small>{detail}</small></span><input type="checkbox" checked={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))} aria-label={title} /></label>)}</div></section>
    </div>
    {error && <DismissibleAlert className="settings-feedback error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
    {message && <DismissibleAlert className="settings-feedback success" role="status" onClose={() => setMessage(null)}>{message}</DismissibleAlert>}
    <div className="settings-actions"><button type="button" className="btn-primary" onClick={save} disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar ajustes'}</button></div>
  </div>;
}
