import request from "./requests";
import * as paths from "./paths"

class login {

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