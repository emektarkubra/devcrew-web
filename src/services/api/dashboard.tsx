import request from "./requests";
import * as paths from "./paths"

class dashboard {
   /**
   * 
   * @static
   * @memberof dashboard
   * 
   */
   static getEnvironement = async () => {
      return await request.get(paths.dashboard)
   }
}

export { dashboard }