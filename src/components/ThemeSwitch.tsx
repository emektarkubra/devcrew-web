import { Tooltip } from 'antd'
import { useTheme } from '../context/themeContext'
import { BsMoon, BsSun } from 'react-icons/bs'

const ThemeSwitch = () => {
    const { isDark, setTheme } = useTheme()

    return (
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <button
                className="login-page__theme-toggle"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
                {isDark ? <BsSun size={18} /> : <BsMoon size={18} />}
            </button>
        </Tooltip>
    )
}

export default ThemeSwitch