import { Select } from 'antd'
import i18next from 'i18next'
import { useState } from 'react'

const LanguageSelect = () => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18next.language || 'en')

    const handleChangeLanguage = (value: string) => {
        i18next.changeLanguage(value)
        localStorage.setItem('lang', value)
        setSelectedLanguage(value)
    }

    return (
        <Select
            value={selectedLanguage}
            onChange={handleChangeLanguage}
            options={[
                { value: 'en', label: '🇬🇧 EN' },
                { value: 'tr', label: '🇹🇷 TR' },
            ]}
        />
    )
}

export default LanguageSelect