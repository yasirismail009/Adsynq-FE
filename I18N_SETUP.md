# Multi-Language Setup (i18n)

This project now supports English and Arabic languages using react-i18next.

## Installation

First, install the required packages:

```bash
npm install i18next react-i18next
```

## Features

- ✅ English (en) and Arabic (ar) support
- ✅ Automatic RTL (Right-to-Left) layout for Arabic
- ✅ Language switcher component in the header
- ✅ Language preference saved in localStorage
- ✅ Translations for common UI elements

## Usage

### Using translations in components:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>{t('integrations.welcome', { name: 'John' })}</p>
    </div>
  );
}
```

### Changing language programmatically:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeToArabic = () => {
    i18n.changeLanguage('ar');
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage('en');
  };
}
```

## Translation Files

- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/ar.json` - Arabic translations

## RTL Support

The application automatically switches to RTL layout when Arabic is selected. The CSS includes RTL utility classes:
- `rtl:mr-6`, `rtl:ml-6` - Margin utilities
- `rtl:pr-10`, `rtl:pl-10` - Padding utilities
- `rtl:flex-row-reverse` - Flex direction
- `rtl:right-0`, `rtl:left-auto` - Position utilities

## Language Switcher

The language switcher is automatically added to the Header component. Users can switch between English and Arabic from there.

