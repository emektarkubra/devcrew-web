// src/services/agents.ts

import request from "./requests"
import * as paths from "./paths"

class agents {

    /**
     * index repo
     * @static
     * @memberof agents
     */
    static indexRepo = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.indexRepo, { token, owner, repo })
    }

    /**
     * codebase qa query
     * @static
     * @memberof agents
     */
    static codebaseQA = async (token: string, owner: string, repo: string, query: string) => {
        return await request.post(paths.codebaseQA, { token, owner, repo, query })
    }

    /**
     * codebase qa history
     * @static
     * @memberof agents
     */
    static codebaseQAHistory = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.codebaseQAHistory, { token, owner, repo })
    }
}

export { agents }