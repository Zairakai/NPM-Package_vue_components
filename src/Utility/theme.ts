export type ThemeMode = 'light' | 'dark' | 'system'

/** The theme to apply for a mode, `system` following the preference of the visitor. */
export function resolveTheme(
  mode: ThemeMode,
  prefersDark: boolean,
): 'light' | 'dark' {
  return mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}
