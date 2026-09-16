import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.07] bg-white/70 text-[#686868] transition-all duration-300 hover:scale-105 hover:text-[#111111] dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0'}`} />
    </button>
  );
}
