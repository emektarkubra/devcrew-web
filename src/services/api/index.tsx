import { agents } from "./agents";
import { profile } from "./profile";


/**
 * All api calls
 *
 * @class api
 */

class api {

    /**
     *
     * Agents
     * @static
     * @memberof agents
     */
    static agents = agents;

    /**
     *
     * Agents
     * @static
     * @memberof profile
     */
    static profile = profile;

}

export { api };