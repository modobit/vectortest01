import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // Check localStorage first, otherwise default to light
        const stored = localStorage.getItem('theme_mode');
        if (stored) {
            return stored === 'dark';
        }
        return false;
    });

    useEffect(() => {
        // Apply theme to document
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme_mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme_mode', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

