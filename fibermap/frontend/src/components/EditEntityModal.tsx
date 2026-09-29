import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import DismissibleAlert from './DismissibleAlert';
import './EditEntityModal.css';

export interface EditFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
}

interface EditEntityModalProps {
  title: string;
  fields: EditFieldConfig[];
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<void> | void;
  onClose: () => void;
}

export default function EditEntityModal({ title, fields, initialValues, onSave, onClose }: EditEntityModalProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Keyboard users expect Escape to close any dialog, and the first field should already
  // have focus so they can start typing immediately without reaching for the mouse.
  useEffect(() => {
    firstFieldRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const setField = (key: string, value: any) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div
        className="edit-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-header">
          <h3 id={titleId}>{title}</h3>
          <button className="edit-modal-close icon-button" onClick={onClose} aria-label="Cerrar diálogo">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          {fields.map((field, index) => {
            const fieldId = `${titleId}-${field.key}`;
            return (
              <label key={field.key} className="edit-modal-field" htmlFor={fieldId}>
                {field.label}
                {field.type === 'select' ? (
                  <select
                    id={fieldId}
                    ref={index === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                  >
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={fieldId}
                    ref={index === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(e) =>
                      setField(field.key, field.type === 'number' ? e.target.value : e.target.value)
                    }
                  />
                )}
              </label>
            );
          })}

          {error && (
            <DismissibleAlert className="edit-modal-error" onClose={() => setError(null)}>
              {error}
            </DismissibleAlert>
          )}

          <div className="edit-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
