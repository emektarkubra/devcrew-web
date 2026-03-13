import request from "./requests";
import * as paths from "./paths"

class login {
    /**
     * Dashboard environment
     * @static
     * @memberof login
     */
    static getEnvironement = async () => {
        return await request.get(paths.dashboard)
    }

    /**
     * GitHub login sayfasına yönlendir
     * @static
     * @memberof login
     */


    static githubLogin = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || (window as any).API_BASE_URL
  const url = `${baseURL}${paths.githubLogin}`
  console.log('GİDİLECEK URL:', url)
  alert(url)  // ← bunu ekle, kaybolmaz
  window.location.href = url
}


    /**
     * Token ile giriş yapan kullanıcının bilgilerini getir
     * @static
     * @memberof login
     */
    static getMe = async (token: string) => {
        return await request.get(paths.getMe, { token })
    }

    /**
     * Kullanıcının repolarını getir
     * @static
     * @memberof login
     */
    static getRepos = async (token: string) => {
        return await request.get(paths.getRepos, { token })
    }

    /**
     * URL'den token'ı al ve localStorage'a kaydet
     * @static
     * @memberof login
     */
    static handleCallback = () => {
        const params = new URLSearchParams(window.location.search)
        const token  = params.get('token')

        if (token) {
        localStorage.setItem('dt-token', token)
        // URL'den token'ı temizle
        window.history.replaceState({}, '', '/')
        return token
        }
        return null
    }

    /**
     * Çıkış yap
     * @static
     * @memberof login
     */
    static logout = () => {
        localStorage.removeItem('dt-token')
        window.location.href = '/'
    }

    /**
     * Kullanıcı giriş yapmış mı kontrol et
     * @static
     * @memberof login
     */
    static isAuthenticated = (): boolean => {
        return !!localStorage.getItem('dt-token')
    }
}

export { login }