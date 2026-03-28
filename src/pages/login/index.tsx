import { useState } from 'react'
import { Tooltip, Select } from 'antd'
import { BsSun, BsMoon } from 'react-icons/bs'
import { FaGithub, FaCheck } from 'react-icons/fa'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useTranslation } from 'react-i18next'
import './index.scss'


const Login = () => {
    const { t, i18n } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

    const handleLogin = () => {
        setIsLoading(true)
        const baseURL = import.meta.env.VITE_API_BASE_URL || (window as any).API_BASE_URL
        window.location.href = `${baseURL}/auth/github/login`
    }

    const toggleDark = () => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDark(false)
        } else {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDark(true)
        }
    }

    const handleLangChange = (lang: string) => {
        i18n.changeLanguage(lang)
        localStorage.setItem('lang', lang)
    }

    return (
        <div className="login-page">

            <div className="login-page__controls">
                <Select
                    size="middle"
                    defaultValue={t("Languages.English")}
                    value={i18n.language}
                    style={{ width: 80 }}
                    onChange={handleLangChange}
                    options={[
                        { value: 'en', label: '🇬🇧 EN' },
                        { value: 'tr', label: '🇹🇷 TR' },
                    ]}
                />
                <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <button className="login-page__theme-toggle" onClick={toggleDark}>
                        {isDark ? <BsSun size={18} /> : <BsMoon size={18} />}
                    </button>
                </Tooltip>
            </div>

            <div className="login-page__card">

                <div className="login-page__header">
                    <FaGithub size={52} className="login-page__github-icon" />
                    <h2>{t('login.welcome')}</h2>
                    <p>{t('login.subtitle')}</p>
                </div>

                <div className="login-page__permissions">
                    <p className="login-page__permissions__title">
                        {t('login.accessTitle')}
                    </p>
                    {(t('login.permissions', { returnObjects: true }) as string[]).map((item) => (
                        <div key={item} className="login-page__permissions__item">
                            <FaCheck size={14} className="login-page__check-icon" />
                            {item}
                        </div>
                    ))}
                </div>

                <button
                    className={`login-page__button ${isLoading ? 'login-page__button--loading' : ''}`}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading
                        ? <AiOutlineLoading3Quarters size={22} className="login-page__spinner" />
                        : <FaGithub size={22} />
                    }
                    {isLoading ? t('login.redirecting') : t('login.signIn')}
                </button>

                <p className="login-page__footer">
                    {t('login.footer')}
                </p>
            </div>
        </div>
    )
}

export default Login;