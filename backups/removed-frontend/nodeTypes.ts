// Types that must always be a real Box (ports, splitters, optical connections),
// never a plain NetworkNode marker — otherwise "NAP" created from one screen
// wouldn't be the same thing as "NAP" created from another.
export const BOX_LIKE_TYPES = ['NAP', 'CTO', 'SPLICE_BOX'];

export function isBoxLikeType(type: string): boolean {
  return BOX_LIKE_TYPES.includes(type);
}
