import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ss', name: 'Siswati', flag: '🇸🇿' },
];

export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();

    const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

    return (
        <Select
            value={i18n.language}
            onValueChange={(lang) => i18n.changeLanguage(lang)}
        >
            <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("sharedLanguage.placeholder", { defaultValue: "Language" })}>
                    <span className="flex items-center gap-2">
                        <span>{current.flag}</span>
                        <span>{current.name}</span>
                    </span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
