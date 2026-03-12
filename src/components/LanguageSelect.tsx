import { Select } from 'antd'
import i18next from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelect = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>()

  const handleChangeLanguage = (value: string) => {
    console.log(`selected ${value}`);
    i18next.changeLanguage(t(value));
    setSelectedLanguage(value)
  };

  return (
    <div className='p-2'>
      <Select
        size="middle"
        defaultValue={t("Languages.English")}
        value={selectedLanguage}
        style={{ width: 100 }}
        onChange={handleChangeLanguage}
        options={[
          { value: 'tr', label: t("Languages.Turkish") },
          { value: 'en', label: t("Languages.English") },
        ]}
      />
    </div>
  )
}

export default LanguageSelect;