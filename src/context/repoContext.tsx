import React, { createContext, useContext, useState } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface RepoContextType {
    repos: any[]
    selectedRepo: string | null
    setSelectedRepo: (repo: string | null) => void
    reposLoading: boolean
    fetchRepos: () => Promise<void>
}

const RepoContext = createContext<RepoContextType>({
    repos: [],
    selectedRepo: null,
    setSelectedRepo: () => { },
    reposLoading: false,
    fetchRepos: async () => { },
})

export const useRepo = () => useContext(RepoContext)

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [reposLoading, setReposLoading] = useState(false)
    const [fetched, setFetched] = useState(false)

    const token = localStorage.getItem('dt-token') || ''

    const fetchRepos = async () => {
        if (fetched || reposLoading) return
        setReposLoading(true)
        try {
            const { data, error } = await api.profile.getRepos(token)
            if (error) {
                toast.error(error)
            } else {
                setRepos(data)
                setFetched(true)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setReposLoading(false)
        }
    }


    return (
        <RepoContext.Provider value={{ repos, selectedRepo, setSelectedRepo, reposLoading, fetchRepos }}>
            {children}
        </RepoContext.Provider>
    )
}