/**
 * A language selector specifically for admin content creation/editing.
 * Lets the super admin choose which language a piece of content (dimension,
 * level, recommendation, gap) is being entered in.
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export const CONTENT_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ss", label: "Siswati", flag: "🇸🇿" },
] as const;

export type ContentLanguageCode = (typeof CONTENT_LANGUAGES)[number]["code"];

interface ContentLanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
  disabled?: boolean;
}

export const ContentLanguageSelector = ({
  value,
  onChange,
  disabled = false,
}: ContentLanguageSelectorProps) => {
  return (
    <div className="relative">
      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTENT_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
