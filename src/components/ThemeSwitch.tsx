import { Switch } from 'antd';
import { useTheme } from '../context/themeContext';

const ThemeSwitch = () => {
    const { isDark, setTheme } = useTheme();

    return (
        <Switch
            size="small"
            checked={isDark}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
    );
};

export default ThemeSwitch;