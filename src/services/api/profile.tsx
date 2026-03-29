import request from "./requests"
import * as paths from "./paths"

class profile {
    /**
     * user profile with token
     * @static
     * @memberof profile
     */
    static getUserProfile = async (token: string) => {
        return await request.get(paths.profile, { token })
    }

    /**
     * user repo list
     * @static
     * @memberof profile
     */
    static getRepos = async (token: string) => {
        return await request.get(paths.repos, { token })
    }

    /**
     * user repo list with filters/search
     * @static
     * @memberof profile
     */
    static getReposWithSearch = async (
        token: string,
        params: any = {}
    ) => {
        return await request.get(paths.repoSearch, {
            token,
            type: params.type ?? "all",
            language: params.language ?? "all",
            sort: params.sort ?? "updated",
            search: params.search ?? "",
            page: params.page ?? 1,
            per_page: params.per_page ?? 10,
        })
    }
}

export { profile }