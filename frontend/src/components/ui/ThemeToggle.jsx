import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative flex items-center justify-center transition-all duration-200 group ${
        compact
          ? 'p-1.5 hover:bg-surface-raised rounded-md'
          : 'p-2 border border-border hover:border-accent rounded-sm'
      }`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
        ) : (
          <Moon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
