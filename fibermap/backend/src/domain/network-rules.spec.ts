import { describe, expect, it } from 'vitest';
import { CABLE_FIBER_COUNTS, DEFAULT_CABLE_COLOR, cableTypeFor, defaultCableColor, fiberColorAt, tubeLayout } from './network-rules.js';

describe('color estándar de la fibra por cantidad de hilos', () => {
  it('2 negro, 6 rosado, 12 azul, 24 verde, 48 café', () => {
    expect(defaultCableColor(2)).toBe('#111827');
    expect(defaultCableColor(6)).toBe('#ec4899');
    expect(defaultCableColor(12)).toBe('#3b82f6');
    expect(defaultCableColor(24)).toBe('#22c55e');
    expect(defaultCableColor(48)).toBe('#8b4513');
  });

  it('todas las cantidades permitidas tienen color propio y distinto', () => {
    const colors = CABLE_FIBER_COUNTS.map(defaultCableColor);
    expect(colors).not.toContain(DEFAULT_CABLE_COLOR);
    expect(new Set(colors).size).toBe(CABLE_FIBER_COUNTS.length);
  });

  it('una cantidad desconocida cae al color por defecto', () => {
    expect(defaultCableColor(7)).toBe(DEFAULT_CABLE_COLOR);
  });

  it('solo la fibra de 2 hilos es un DROP', () => {
    expect(cableTypeFor(2)).toBe('DROP');
    expect([6, 12, 24, 48].map(cableTypeFor)).toEqual(['DISTRIBUTION', 'DISTRIBUTION', 'DISTRIBUTION', 'DISTRIBUTION']);
  });

  it('los buffers siguen las hojas de empalme: 12 = 2x6, 24 = 4x6, 48 = 4x12', () => {
    expect(tubeLayout(2)).toEqual({ fibersPerTube: 2, tubeCount: 1 });
    expect(tubeLayout(6)).toEqual({ fibersPerTube: 6, tubeCount: 1 });
    expect(tubeLayout(12)).toEqual({ fibersPerTube: 6, tubeCount: 2 });
    expect(tubeLayout(24)).toEqual({ fibersPerTube: 6, tubeCount: 4 });
    expect(tubeLayout(48)).toEqual({ fibersPerTube: 12, tubeCount: 4 });
  });

  it('el código de colores se repite dentro de cada buffer', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 12, 13].map(fiberColorAt)).toEqual(
      ['BLUE', 'ORANGE', 'GREEN', 'BROWN', 'SLATE', 'WHITE', 'RED', 'AQUA', 'BLUE'],
    );
  });
});
