import { TFunction } from 'i18next'

export const timeAgo = (date: string, t: TFunction): string => {
    const dateStr = date.endsWith('Z') || date.includes('+') ? date : date + 'Z'
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)

    if (diff < 60) return t('timeAgo.justNow')
    if (diff < 3600) return t('timeAgo.minutesAgo', { count: Math.floor(diff / 60) })
    if (diff < 86400) return t('timeAgo.hoursAgo', { count: Math.floor(diff / 3600) })
    if (diff < 86400 * 2) return t('timeAgo.yesterday')
    if (diff < 86400 * 7) return t('timeAgo.daysAgo', { count: Math.floor(diff / 86400) })
    if (diff < 86400 * 30) return t('timeAgo.weeksAgo', { count: Math.floor(diff / 86400 / 7) })
    if (diff < 86400 * 365) return t('timeAgo.monthsAgo', { count: Math.floor(diff / 86400 / 30) })
    return t('timeAgo.yearsAgo', { count: Math.floor(diff / 86400 / 365) })
}