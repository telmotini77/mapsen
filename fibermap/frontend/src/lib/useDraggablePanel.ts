import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';

interface Position {
  left: number;
  top: number;
}

const KEY_STEP = 16;
const KEY_STEP_LARGE = 64;

function readStored(storageKey: string): Position | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed?.left) && Number.isFinite(parsed?.top) ? { left: parsed.left, top: parsed.top } : null;
  } catch {
    return null;
  }
}

function store(storageKey: string, position: Position | null) {
  try {
    if (position) localStorage.setItem(storageKey, JSON.stringify(position));
    else localStorage.removeItem(storageKey);
  } catch {
    // Sin almacenamiento disponible: el panel simplemente no recuerda su posición.
  }
}

// Permite mover un panel `position: absolute` arrastrando su cabecera (ratón o táctil) o con
// las flechas del teclado. Sin posición guardada el panel queda "anclado" por su CSS (a la
// derecha); al moverlo se recuerda para la próxima vez. Doble clic o Inicio lo devuelve a su sitio.
export function useDraggablePanel(storageKey: string) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const [position, setPositionState] = useState<Position | null>(() => readStored(storageKey));
  // Copia síncrona de la posición: varias pulsaciones seguidas deben acumularse aunque React
  // todavía no haya vuelto a renderizar entre una y otra.
  const positionRef = useRef<Position | null>(position);
  const setPosition = useCallback((next: Position | null | ((prev: Position | null) => Position | null)) => {
    positionRef.current = typeof next === 'function' ? next(positionRef.current) : next;
    setPositionState(positionRef.current);
  }, []);

  // Mantiene el panel dentro de su contenedor (con la cabecera siempre a la vista).
  const clamp = useCallback((left: number, top: number): Position => {
    const panel = panelRef.current;
    const parent = panel?.offsetParent as HTMLElement | null;
    if (!panel || !parent) return { left, top };
    const maxLeft = Math.max(0, parent.clientWidth - panel.offsetWidth);
    const maxTop = Math.max(0, parent.clientHeight - 56);
    return { left: Math.min(Math.max(0, left), maxLeft), top: Math.min(Math.max(0, top), maxTop) };
  }, []);

  const currentPosition = useCallback((): Position | null => {
    const panel = panelRef.current;
    const parent = panel?.offsetParent as HTMLElement | null;
    if (!panel || !parent) return null;
    const rect = panel.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    return { left: rect.left - parentRect.left, top: rect.top - parentRect.top };
  }, []);

  // Al cambiar el tamaño de la ventana, una posición guardada podría quedar fuera de pantalla.
  useEffect(() => {
    const reclamp = () => setPosition((prev) => (prev ? clamp(prev.left, prev.top) : prev));
    reclamp();
    window.addEventListener('resize', reclamp);
    return () => window.removeEventListener('resize', reclamp);
  }, [clamp, setPosition]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    // Los botones y campos de la cabecera siguen funcionando con normalidad.
    if ((event.target as HTMLElement).closest('input, select, textarea, [data-no-drag]')) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragOffset.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Sin captura el arrastre igual funciona mientras el puntero siga sobre la cabecera.
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const offset = dragOffset.current;
    const parent = panelRef.current?.offsetParent as HTMLElement | null;
    if (!offset || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    setPosition(clamp(event.clientX - parentRect.left - offset.dx, event.clientY - parentRect.top - offset.dy));
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragOffset.current) return;
    dragOffset.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ya liberado
    }
    store(storageKey, positionRef.current);
  };

  const reset = useCallback(() => {
    setPosition(null);
    store(storageKey, null);
  }, [storageKey, setPosition]);

  // Accesibilidad: con el asa enfocada, las flechas mueven el panel (Mayús = paso grande).
  const onHandleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Home') {
      event.preventDefault();
      reset();
      return;
    }
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    const start = positionRef.current ?? currentPosition();
    if (!start) return;
    const next = clamp(start.left + move[0], start.top + move[1]);
    setPosition(next);
    store(storageKey, next);
  };

  return {
    panelRef,
    // Estilo en línea solo cuando el usuario movió el panel; si no, manda el CSS (anclado a la derecha).
    style: position ? ({ left: position.left, top: position.top, right: 'auto' } as const) : undefined,
    moved: position !== null,
    reset,
    headerProps: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onDoubleClick: reset },
    handleProps: { onKeyDown: onHandleKeyDown },
  };
}
