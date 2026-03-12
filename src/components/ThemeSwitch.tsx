import { Switch } from 'antd'
import { useEffect, useState } from 'react';

const ThemeSwitch = () => {

    const [theme, setTheme] = useState("light");
    const [checked, setChecked] = useState(false)

    const handleToggleChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
        localStorage.setItem('theme', JSON.stringify(checked ? 'dark' : 'light'))
    };

    useEffect(() => {
        const themeItem = localStorage.getItem("theme");
        if (themeItem) {
            const storedTheme = JSON.parse(themeItem);
            setTheme(storedTheme)
        } else {
            console.log("No theme found in localStorage");
        }
    }, []);

    useEffect(() => {
        const htmlElement = document.querySelector('html');
        if (htmlElement) {
            if (theme === 'dark') {
                htmlElement.classList.add('dark');
                setChecked(true)
            } else {
                htmlElement.classList.remove('dark');
                setChecked(false)
            }
        }
    }, [theme]);

    return (
        <Switch size="small" checked={checked} className='dark:bg-slate-900' onChange={handleToggleChange} />
    )
}

export default ThemeSwitch