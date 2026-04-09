import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface RepoContextType {
    repos: any[]
    selectedRepo: string | null
    setSelectedRepo: (repo: string | null) => void
    reposLoading: boolean
}

const RepoContext = createContext<RepoContextType>({
    repos: [],
    selectedRepo: null,
    setSelectedRepo: () => { },
    reposLoading: false,
})

export const useRepo = () => useContext(RepoContext)

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [reposLoading, setReposLoading] = useState(false)

    const token = localStorage.getItem('dt-token') || ''

    useEffect(() => {
        const fetchRepos = async () => {
            setReposLoading(true)
            try {
                const { data, error } = await api.profile.getRepos(token)
                if (error) {
                    toast.error(error)
                } else {
                    setRepos(data)
                    if (data?.length > 0) setSelectedRepo(data[0].full_name)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setReposLoading(false)
            }
        }
        fetchRepos()
    }, [])

    return (
        <RepoContext.Provider value={{ repos, selectedRepo, setSelectedRepo, reposLoading }}>
            {children}
        </RepoContext.Provider>
    )
}