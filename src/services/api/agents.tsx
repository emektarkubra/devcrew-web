// src/services/agents.ts

import request from "./requests"
import * as paths from "./paths"

class agents {

    /**
     * index repo
     */
    static indexRepo = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.indexRepo, { token, owner, repo })
    }

    /**
     * codebase qa query
     */
    static codebaseQA = async (token: string, owner: string, repo: string, query: string) => {
        return await request.post(paths.codebaseQA, { token, owner, repo, query })
    }

    /**
     * codebase qa history
     */
    static codebaseQAHistory = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.codebaseQAHistory, { token, owner, repo })
    }

    /**
     * pr list
     */
    static prList = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.prList, { token, owner, repo })
    }

    /**
     * pr review
     */
    static prReview = async (token: string, owner: string, repo: string, pr_number: number) => {
        return await request.post(paths.prReview, { token, owner, repo, pr_number })
    }

    /**
     * pr review history
     */
    static prReviewHistory = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.prReviewHistory, { token, owner, repo })
    }

    /**
     * debug error
     */
    static debug = async (token: string, owner: string, repo: string, error: string) => {
        return await request.post(paths.debug, { token, owner, repo, error })
    }

    /**
     * debug history
     */
    static debugHistory = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.debugHistory, { token, owner, repo })
    }


    /**
     * generate documentation
     */
    static documentation = async (token: string, owner: string, repo: string, target: string, doc_type: string) => {
        return await request.post(paths.documentation, { token, owner, repo, target, doc_type })
    }

    /**
     * documentation history
     */
    static documentationHistory = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.documentationHistory, { token, owner, repo })
    }


    /**
     * repo file list
     */
    static repoFiles = async (token: string, owner: string, repo: string) => {
        return await request.post(paths.repoFiles, { token, owner, repo })
    }
}

export { agents }