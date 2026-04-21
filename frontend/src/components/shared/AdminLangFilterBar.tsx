/**
 * Language filter tabs for admin list pages.
 * Lets the super admin view content for all languages at once or filter to one.
 */
import { AdminLangFilter } from "@/hooks/useAdminLangFilter";

const TABS: { value: AdminLangFilter; label: string; flag?: string }[] = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "ss", label: "Siswati", flag: "🇸🇿" },
];

interface AdminLangFilterBarProps {
  value: AdminLangFilter;
  onChange: (lang: AdminLangFilter) => void;
}

export const AdminLangFilterBar = ({ value, onChange }: AdminLangFilterBarProps) => (
  <div className="flex flex-wrap gap-2">
    {TABS.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
          ${value === tab.value
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
          }`}
      >
        {tab.flag && <span>{tab.flag}</span>}
        {tab.label}
      </button>
    ))}
  </div>
);
