import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    isDark: true,
    setTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('dark');

    // 🔥 initial load
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        const initial = stored || 'dark';

        setThemeState(initial);

        document.documentElement.classList.toggle('dark', initial === 'dark');
    }, []);

    // 🔥 theme değişince her şeyi güncelle
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: theme === 'dark',
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);