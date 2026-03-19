export const LANGUAGE_COLORS: Record<string, { light: string; dark: string }> = {
    TypeScript:  { light: '#3178c6', dark: '#4d9de0' },
    JavaScript:  { light: '#f1e05a', dark: '#f1e05a' },
    Python:      { light: '#3572A5', dark: '#4b8bbe' },
    Java:        { light: '#b07219', dark: '#f89820' },
    Go:          { light: '#00ADD8', dark: '#00D4FF' },
    Rust:        { light: '#dea584', dark: '#f0a070' },
    'C++':       { light: '#f34b7d', dark: '#f34b7d' },
    C:           { light: '#555555', dark: '#aaaaaa' },
    'C#':        { light: '#178600', dark: '#2eca44' },
    Ruby:        { light: '#701516', dark: '#cc342d' },
    PHP:         { light: '#4F5D95', dark: '#7a86c7' },
    Swift:       { light: '#F05138', dark: '#F05138' },
    Kotlin:      { light: '#A97BFF', dark: '#A97BFF' },
    Scala:       { light: '#c22d40', dark: '#e84a5f' },
    Dart:        { light: '#00B4AB', dark: '#00D4C8' },
    Elixir:      { light: '#6e4a7e', dark: '#9b6fc4' },
    Haskell:     { light: '#5e5086', dark: '#8a76c4' },
    Lua:         { light: '#000080', dark: '#4040cc' },
    Shell:       { light: '#89e051', dark: '#89e051' },
    HTML:        { light: '#e34c26', dark: '#e34c26' },
    CSS:         { light: '#563d7c', dark: '#8a6cbf' },
    Vue:         { light: '#41b883', dark: '#41b883' },
    Jupyter:     { light: '#DA5B0B', dark: '#f57c2b' },
    R:           { light: '#198CE7', dark: '#4db8ff' },
    MATLAB:      { light: '#e16737', dark: '#f0854d' },
    Dockerfile:  { light: '#384d54', dark: '#6b9aaa' },
}

export const getLanguageColor = (language: string, isDark = false): string => {
    const colors = LANGUAGE_COLORS[language]
    if (!colors) return isDark ? '#8b949e' : '#6b7280'
    return isDark ? colors.dark : colors.light
}