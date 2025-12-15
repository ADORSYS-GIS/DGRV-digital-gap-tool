# Internationalization (i18n) Guide

This project uses i18next and react-i18next to provide multilingual support across the frontend. Language detection and persistence are enabled via `i18next-browser-languagedetector` with `localStorage` caching.

Supported languages:
- English (en) [default, fallback]
- Deutsch (de)
- Français (fr)
- Português (pt)
- siSwati (ss)
- Zulu (zu)

## Stack

- i18next
- react-i18next
- i18next-browser-languagedetector

## Directory Structure

- frontend/src/i18n/index.ts – i18n initialization, language detector setup, supported language list, and <html lang> syncing.
- frontend/src/i18n/locales/<lng>.json – Translation resources per language (single "translation" namespace).

Example:
- frontend/src/i18n/locales/en.json
- frontend/src/i18n/locales/de.json
- frontend/src/i18n/locales/fr.json
- frontend/src/i18n/locales/pt.json
- frontend/src/i18n/locales/ss.json
- frontend/src/i18n/locales/zu.json

## Initialization

i18n is initialized once and imported by the app entry points:

- Import side-effect in:
  - frontend/src/main.tsx
  - frontend/src/main.lazy.tsx

Key behaviors configured:
- fallbackLng: "en"
- supportedLngs: derived from exported `supportedLanguages`
- detection order: ["localStorage", "navigator"]
- caches: ["localStorage"], key: "i18nextLng"
- Interpolation: escapeValue: false (React already escapes)
- Sets `document.documentElement.lang` on init and on language change for a11y/SEO

## How to Use in Components (React)

1) Get the translator with react-i18next:

```tsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <button onClick={() => i18n.changeLanguage("de")}>
      {t("home.getStarted", { defaultValue: "Get Started" })}
    </button>
  );
};
```

Notes:
- Always provide a sensible defaultValue during rollout to avoid UI regressions when keys are missing.
- Prefer keys organized by module/feature and reuse `common.*` for generic labels.

2) Using in non-React contexts (schemas, services)

```ts
import i18n from "@/i18n";

const message = i18n.t("validation.dimensionNameRequired", {
  defaultValue: "Name is required",
});
```

This pattern is safe in Zod schemas, services, repositories, or any non-component file.

## Language Switchers

Two switchers are available:
- Shared dropdown in the navbar: frontend/src/components/shared/LanguageSwitcher.tsx
- Profile Settings page dropdown: frontend/src/pages/ProfileSettings.tsx

Switching languages calls:

```ts
i18n.changeLanguage(code);
```

The detector saves the selection in localStorage under "i18nextLng". On reload, the selected language is restored automatically.

## Key Naming Conventions

Use a consistent, scalable naming scheme that groups by feature. Examples:

- Common, generic UI:
  - common.language
  - common.selectLanguage
  - common.name
  - common.description
  - common.descriptionOptional
  - common.adding
  - common.updating
  - common.edit
  - common.delete
  - common.actions
  - common.cancel
  - common.update
  - common.create

- Validation messages:
  - validation.dimensionRequired
  - validation.scopeRequired
  - validation.dimensionNameRequired

- Feature modules:
  - admin.dimensions.*
    - admin.dimensions.addTitle
    - admin.dimensions.addAction
    - admin.dimensions.editTitle
    - admin.dimensions.updateAction
    - admin.dimensions.form.namePlaceholder
  - admin.digitalisationGaps.*
    - admin.digitalisationGaps.table.description
    - admin.digitalisationGaps.table.severity
    - admin.digitalisationGaps.table.actions
    - admin.digitalisationGaps.dialog.editTitle
    - admin.digitalisationGaps.dialog.addTitle
    - admin.digitalisationGaps.form.gapSeverity
    - admin.digitalisationGaps.form.selectSeverity
    - admin.digitalisationGaps.form.scopePlaceholder
    - admin.digitalisationGaps.errors.duplicateSeverity

- Enums/statuses:
  - gap.severity.high | medium | low
  - recommendation.priority.low | medium | high (if/when introduced)
  - action.status.todo | in_progress | done | approved (if/when introduced)

Try to keep keys stable. If you must rename keys, update all locales consistently.

## Adding a New Language

1) Create a new file:
   - frontend/src/i18n/locales/<code>.json

   Start by copying en.json, then translate. Keep the top-level "translation" object.

2) Wire it in i18n:
   - Import the JSON in frontend/src/i18n/index.ts
   - Add to the resources map and to `supportedLanguages`

Example:

```ts
import sw from "./locales/sw.json";

const resources = {
  // ...
  sw: { translation: sw.translation },
};

export const supportedLanguages = [
  // ...
  { code: "sw", name: "Kiswahili" },
];
```

3) Expose in UI:
   - Navbar LanguageSwitcher and Profile Settings page:
     - For LanguageSwitcher, either add to the local array or refactor to use `supportedLanguages` exported by i18n.
     - ProfileSettings already uses `supportedLanguages`.

4) Verify:
   - The app should switch to the new language and persist across reloads.
   - Missing keys should fall back to English due to `fallbackLng: "en"`.

## Fallbacks and Default Values

- With `fallbackLng: "en"`, missing keys render from the English locale.
- During rollout, use `t("key", { defaultValue: "…" })` whenever you wire new UI to translations to avoid temporary regressions before translators finalize all files.

## Testing and QA Checklist

Manual checks:
- Default language is English when no selection is present.
- Changing language via Navbar/Profile updates all visible texts immediately.
- The chosen language persists after reload (check localStorage for "i18nextLng").
- Missing keys gracefully show English values (and preferably do not break layouts).
- Form validation and any toasts/errors use localized strings.
- The HTML document lang attribute updates (inspect <html lang="…">).

Developer checks:
- Grep for hardcoded strings and progressively replace them with `t(...)`.
- Ensure non-React validations and services use `i18n.t(...)`.
- Keep translation keys synchronized across all locale files.

## Tips

- Prefer `supportedLanguages` from i18n for a single source of truth. Consider refactoring UI switchers to rely on it to avoid duplication.
- If you introduce namespaces in the future (e.g., "admin", "onboarding", etc.), update initialization accordingly or maintain a flat "translation" namespace as we do now.

## Known Patterns Used in This Codebase

- Validation via Zod using i18n.t with defaultValue:
  - Ensures validation messages are localized even outside React.
- Component labels, buttons, placeholders use `useTranslation` with `t("key", { defaultValue })`.
- Shared/common dictionary in `common.*` reduces duplication.
- Feature-level keys (e.g., `admin.dimensions.*`) keep translations discoverable and maintainable.

## Troubleshooting

- Language does not change:
  - Ensure `i18n.changeLanguage(code)` is invoked and that `code` is one of `supportedLngs`.
- App does not remember selected language:
  - Confirm localStorage is available and "i18nextLng" is set.
  - Check detection order includes "localStorage".
- Text displays in English despite locale having a translation:
  - Verify the key exists in the target locale and matches exactly.
  - Confirm `fallbackLng` isn’t masking a missing resource import.

## Credits and References

- react-i18next: https://react.i18next.com/
- i18next: https://www.i18next.com/
- Language detector: https://github.com/i18next/i18next-browser-languageDetector