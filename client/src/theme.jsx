import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Two looks: "dark" (the original futuristic neon theme) and "light" (calmer, plainer, less motion).
// The choice is stored in localStorage; with no stored choice we follow the device's light/dark setting.
// index.html sets data-theme before React loads so the page never flashes the wrong colours.
const KEY = 'leap-theme';
const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

function stored() {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch { return null; }
}
function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function apply(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f7fa' : '#0b1620');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme || stored() || systemTheme());

  useEffect(() => { apply(theme); }, [theme]);

  // Follow the device setting live, until the visitor picks a theme themselves.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!mq) return undefined;
    const onChange = () => { if (!stored()) setThemeState(mq.matches ? 'light' : 'dark'); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((t) => {
    try { localStorage.setItem(KEY, t); } catch { /* private mode: still switch for this visit */ }
    setThemeState(t);
  }, []);
  const toggle = useCallback(() => setTheme(theme === 'light' ? 'dark' : 'light'), [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Light theme is the "calm" look: decorative motion (tilt, scramble, particles) is switched off.
export function useCalm() {
  const { theme } = useTheme();
  return theme === 'light';
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';
  return (
    <button type="button" className={`btn btn-icon theme-toggle ${className}`} onClick={toggle}
      aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

