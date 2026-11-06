export function reserveTarget<T extends { kind: string }>(tool: string, target: T | null): T | null | undefined {
  if (tool !== 'reserve') return undefined;
  return target?.kind === 'NAP' || target?.kind === 'MANGA' ? target : null;
}
