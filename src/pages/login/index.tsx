import { useState } from 'react'
import './index.scss'

const Login = () => {
    const [isLoading, setIsLoading] = useState(false)

    const githubLoginInfo = [
        'Profile information (username, avatar)',
        'Public and private repositories',
        'Email address'
    ]

    const handleLogin = () => {
        setIsLoading(true)
        const baseURL = import.meta.env.VITE_API_BASE_URL || (window as any).API_BASE_URL
        window.location.href = `${baseURL}/auth/github/login`
    }

    return (
        <div className="login-page">
            <div className="login-page__card">

                <div className="login-page__header">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="#e6edf3">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <h2>Welcome</h2>
                    <p>Sign in with your GitHub account to continue</p>
                </div>

                <div className="login-page__permissions">
                    <p className="login-page__permissions__title">This app will have access to:</p>
                    {githubLoginInfo?.map((item) => (
                        <div key={item} className="login-page__permissions__item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#3fb950">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                            {item}
                        </div>
                    ))}
                </div>

                <button
                    className={`login-page__button ${isLoading ? 'login-page__button--loading' : ''}`}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg
                            className="login-page__spinner"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                        >
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    )}
                    {isLoading ? 'Redirecting...' : 'Sign in with GitHub'}
                </button>

                <p className="login-page__footer">
                    By signing in, you agree to GitHub's terms of service
                </p>
            </div>
        </div>
    )
}

export default Login