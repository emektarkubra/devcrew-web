import request from "./requests";
import * as paths from "./paths"

class login {

    /**
     * redirect gitHub login
     * @static
     * @memberof login
     */
    static githubLogin = () => {
        const baseURL = import.meta.env.VITE_API_BASE_URL || (window as any).API_BASE_URL
        window.location.href = `${baseURL}${paths.githubLogin}`
    }

    /**
     * user profile with token
     * @static
     * @memberof login
     */
    static getUserProfile = async (token: string) => {
        return await request.get(paths.profile, { token })
    }

    /**
     * user repo list
     * @static
     * @memberof login
     */
    static getRepos = async (token: string) => {
        return await request.get(paths.repos, { token })
    }

    /**
     * get token from url and save
     * @static
     * @memberof login
     */
    static handleCallback = () => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (token) {
            localStorage.setItem('dt-token', token)
            window.history.replaceState({}, '', '/')
            return token
        }
        return null
    }

    /**
     * logout
     * @static
     * @memberof login
     */
    static logout = () => {
        localStorage.removeItem('dt-token')
        window.location.href = '/'
    }

    /**
     * is user authenticated
     * @static
     * @memberof login
     */
    static isAuthenticated = (): boolean => {
        return !!localStorage.getItem('dt-token')
    }
}

export { login }