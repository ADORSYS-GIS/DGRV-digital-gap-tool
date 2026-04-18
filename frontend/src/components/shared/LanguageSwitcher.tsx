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
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
];

export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();

    return (
        <Select
            value={i18n.language}
            onValueChange={(lang) => i18n.changeLanguage(lang)}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("sharedLanguage.placeholder", { defaultValue: "Language" })} />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
