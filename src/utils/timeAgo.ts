export const timeAgo = (date: string): string => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

    if (diff < 60)                    return 'just now'
    if (diff < 3600)                  return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400)                 return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 86400 * 2)             return 'yesterday'
    if (diff < 86400 * 7)             return `${Math.floor(diff / 86400)} days ago`
    if (diff < 86400 * 30)            return `${Math.floor(diff / 86400 / 7)} weeks ago`
    if (diff < 86400 * 365)           return `${Math.floor(diff / 86400 / 30)} months ago`
    return `${Math.floor(diff / 86400 / 365)} years ago`
}