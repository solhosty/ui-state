/** Small, consistent stroke icons. No font glyphs or external icon runtime. */
export const iconPaths = {
  focus:
    '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M8 8l-5-5M16 8l5-5M8 16l-5 5M16 16l5 5"/>',
  brand:
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 13h3v3H8zM15 13h2m-2 3h2"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  workspace:
    '<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M8 6V3h8v3M3 11h18"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>',
  page: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  arrow: '<path d="M6 18 18 6M6 6h12v12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  map: '<rect x="2" y="9" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M8 12h4V5h4M12 12v7h4"/>',
  fit: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
} as const
export function icon(name: keyof typeof iconPaths): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`
}
