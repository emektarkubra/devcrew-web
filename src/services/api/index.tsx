import { dashboard } from "./dashboard";
import { login } from "./login";


/**
 * All api calls
 *
 * @class api
 */

class api {

    /**
     *
     * Auth
     * @static
     * @memberof api
     */
    static dashboard = dashboard;


    /**
     *
     * Login
     * @static
     * @memberof login
     */
    static login = login;

}

export { api };