import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        // Persist to localStorage so it survives page refresh
        localStorage.setItem('i18nextLng', lang);
        // Invalidate all content queries so they refetch in the new language
        queryClient.invalidateQueries({ queryKey: ["dimensionWithStates"] });
        queryClient.invalidateQueries({ queryKey: ["dimensions"] });
        queryClient.invalidateQueries({ queryKey: ["assessmentDimensions"] });
        queryClient.invalidateQueries({ queryKey: ["digitalisationLevels"] });
        queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
        queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    };

    const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

    return (
        <Select
            value={i18n.language}
            onValueChange={handleLanguageChange}
        >
            <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("sharedLanguage.placeholder", { defaultValue: "Language" })}>
                    <span className="flex items-center gap-2">
                        <span>{current?.flag}</span>
                        <span>{current?.name}</span>
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
