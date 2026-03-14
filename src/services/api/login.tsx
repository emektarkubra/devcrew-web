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
        const url = `${baseURL}${paths.githubLogin}`
        console.log('GİDİLECEK URL:', url)
        alert(url) 
        window.location.href = url
    }


    /**
     * user info with token
     * @static
     * @memberof login
     */
    static getMe = async (token: string) => {
        return await request.get(paths.getMe, { token })
    }

    /**
     * user repo list
     * @static
     * @memberof login
     */
    static getRepos = async (token: string) => {
        return await request.get(paths.getRepos, { token })
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
            // URL'den token'ı temizle
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
     * 
     * @static
     * @memberof login
     */
    static isAuthenticated = (): boolean => {
        return !!localStorage.getItem('dt-token')
    }
}

export { login }